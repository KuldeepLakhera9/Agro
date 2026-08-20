import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Farmer from "@/lib/models/Farmer";
import FarmerOffer from "@/lib/models/FarmerOffer";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import { notify } from "@/lib/notifications/notify";
import { pick } from "@/lib/localizedField";

export interface CreateGoodsReceiptInput {
  farmerOfferId: string;
  quantityReceived: number;
  pricePerUnit: number;
  recordedBy: string;
}

export type CreateGoodsReceiptResult =
  | { ok: true; receiptId: string }
  | { ok: false; error: "offer_not_found" | "offer_not_accepted" | "product_not_found" };

/**
 * Receiving stock is purely additive — there's no oversell/race hazard the
 * way sales-side stock decrements have (lib/queries/orders.ts). Still uses
 * an atomic `$inc` rather than read-then-write, per the brief's blanket
 * rule, so two receipts logged back to back never clobber each other.
 */
export async function createGoodsReceipt(
  input: CreateGoodsReceiptInput,
): Promise<CreateGoodsReceiptResult> {
  await connectDB();

  const offer = await FarmerOffer.findById(input.farmerOfferId);
  if (!offer) return { ok: false, error: "offer_not_found" };
  if (offer.status !== "accepted") return { ok: false, error: "offer_not_accepted" };

  const purchaseRequest = await PurchaseRequest.findById(offer.purchaseRequestId);
  if (!purchaseRequest) return { ok: false, error: "product_not_found" };

  const product = await Product.findById(purchaseRequest.product.productId);
  if (!product) return { ok: false, error: "product_not_found" };

  const totalAmount = input.quantityReceived * input.pricePerUnit;

  const receipt = await GoodsReceipt.create({
    farmerOfferId: offer._id,
    farmerId: offer.farmerId,
    productId: product._id,
    unit: purchaseRequest.unit,
    quantityReceived: input.quantityReceived,
    pricePerUnit: input.pricePerUnit,
    totalAmount,
    receivedAt: new Date(),
    recordedBy: input.recordedBy,
  });

  const updated = await Product.findByIdAndUpdate(
    product._id,
    { $inc: { "rawStock.quantity": input.quantityReceived } },
    { returnDocument: "after" },
  );

  const farmer = await Farmer.findById(offer.farmerId);
  if (farmer) {
    await notify({
      type: "goods_receipt_confirmation",
      phone: farmer.phone,
      productName: purchaseRequest.product.name,
      quantity: input.quantityReceived,
      unit: purchaseRequest.unit,
      pricePerUnit: input.pricePerUnit,
      totalAmount,
    });
  }

  if (updated?.rawStock && updated.rawStock.quantity < updated.rawStock.lowStockThreshold) {
    await notify({
      type: "low_stock_alert",
      productName: pick(product.name, "en"),
      quantity: updated.rawStock.quantity,
      unit: updated.rawStock.unit,
      threshold: updated.rawStock.lowStockThreshold,
    });
  }

  return { ok: true, receiptId: String(receipt._id) };
}
