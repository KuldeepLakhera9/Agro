import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Order, { type OrderDoc } from "@/lib/models/Order";
import { pick } from "@/lib/localizedField";
import { isPincodeServiceable } from "@/lib/queries/deliveryZones";
import { notify } from "@/lib/notifications/notify";

export interface CreateOrderInput {
  orderRef: string;
  userId: string;
  phone: string;
  locale: "mr" | "hi" | "en";
  items: { sku: string; qty: number }[];
  deliveryMethod: "home_delivery" | "store_pickup";
  address?: {
    fullName: string;
    line: string;
    city: string;
    pincode: string;
    state: string;
    phone: string;
  };
}

export type CreateOrderResult =
  | { ok: true; order: OrderDoc & { _id: unknown } }
  | { ok: false; error: "delivery_out_of_zone" }
  | { ok: false; error: "invalid_item" }
  | { ok: false; error: "out_of_stock"; sku: string };

/**
 * Idempotency and the stock guard both rely on being first to a unique
 * index, in this order:
 *
 * 1. Claim the orderRef via `Order.create()`. The unique index on
 *    orderRef means at most one concurrent request wins this insert —
 *    a retried/duplicate submit (network retry, double form submission)
 *    hits the duplicate-key error and just returns the order the winner
 *    already created, with stock untouched by the loser.
 * 2. Only the request that won the claim decrements stock, per item,
 *    with an atomic `findOneAndUpdate` guard (`stock >= qty` in the same
 *    operation that decrements it) — this is what stops two *different*
 *    orders from overselling the same variant. If a later item in the
 *    same order is out of stock, already-decremented items in this order
 *    are compensated (incremented back) and the claimed order is removed.
 *
 * Doing the claim before the stock decrement (rather than after) means
 * there's never a window where stock is decremented twice for one
 * logical order. This runs as a sequence of atomic single-document
 * operations rather than a multi-document transaction because local dev
 * here uses a standalone mongod (no replica set required for the
 * per-document atomicity this relies on). On MongoDB Atlas — always a
 * replica set — the claim + decrement loop can be wrapped in a
 * `mongoose.startSession()` transaction for full multi-document
 * atomicity if desired.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  await connectDB();

  const existing = await Order.findOne({ orderRef: input.orderRef });
  if (existing) return { ok: true, order: existing.toObject() };

  if (input.deliveryMethod === "home_delivery") {
    if (!input.address) return { ok: false, error: "invalid_item" };
    const serviceable = await isPincodeServiceable(input.address.pincode);
    if (!serviceable) return { ok: false, error: "delivery_out_of_zone" };
  }

  const skus = input.items.map((i) => i.sku);
  const products = await Product.find({ "variants.sku": { $in: skus } });

  const bySku = new Map<
    string,
    { productId: string; name: string; size: string; price: number }
  >();
  for (const product of products) {
    for (const variant of product.variants) {
      if (skus.includes(variant.sku)) {
        bySku.set(variant.sku, {
          productId: String(product._id),
          name: pick(product.name, input.locale),
          size: variant.size,
          price: variant.price,
        });
      }
    }
  }

  if (bySku.size !== new Set(skus).size) {
    return { ok: false, error: "invalid_item" };
  }

  const orderItems = input.items.map((i) => {
    const info = bySku.get(i.sku)!;
    return {
      productId: info.productId,
      sku: i.sku,
      name: info.name,
      size: info.size,
      price: info.price,
      qty: i.qty,
    };
  });
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  let order;
  try {
    order = await Order.create({
      orderRef: input.orderRef,
      userId: input.userId,
      locale: input.locale,
      items: orderItems,
      subtotal,
      total: subtotal,
      deliveryMethod: input.deliveryMethod,
      address: input.address,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "placed",
      statusHistory: [{ status: "placed", at: new Date() }],
    });
  } catch (err: unknown) {
    // Concurrent retry of the same orderRef raced us — the unique index
    // caught it, so fetch and return what the other request created.
    // Stock was never touched by this request, so there's nothing to undo.
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      const raced = await Order.findOne({ orderRef: input.orderRef });
      if (raced) return { ok: true, order: raced.toObject() };
    }
    throw err;
  }

  const decremented: { sku: string; qty: number }[] = [];

  for (const item of input.items) {
    // $elemMatch binds sku and stock to the SAME array element — a plain
    // {"variants.sku": ..., "variants.stock": {$gte: ...}} filter lets the
    // two conditions match against different elements (any variant with
    // enough stock would satisfy the query even if the requested sku's
    // own variant is out of stock), and the positional $ in the update
    // would then decrement the wrong variant.
    const result = await Product.findOneAndUpdate(
      { variants: { $elemMatch: { sku: item.sku, stock: { $gte: item.qty } } } },
      { $inc: { "variants.$.stock": -item.qty } },
    );
    if (!result) {
      for (const done of decremented) {
        await Product.findOneAndUpdate(
          { "variants.sku": done.sku },
          { $inc: { "variants.$.stock": done.qty } },
        );
      }
      await Order.deleteOne({ _id: order._id });
      return { ok: false, error: "out_of_stock", sku: item.sku };
    }
    decremented.push(item);
  }

  await notify({
    type: "order_confirmed",
    phone: input.phone,
    orderRef: order.orderRef,
    total: order.total,
  });

  return { ok: true, order: order.toObject() };
}
