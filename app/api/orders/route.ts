import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createOrder } from "@/lib/queries/orders";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";

const addressSchema = z.object({
  fullName: z.string().min(1),
  line: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  state: z.string().min(1),
  phone: z.string().min(1),
});

const schema = z.object({
  orderRef: z.string().uuid(),
  items: z.array(z.object({ sku: z.string(), qty: z.number().int().min(1) })).min(1),
  deliveryMethod: z.enum(["home_delivery", "store_pickup"]),
  address: addressSchema.optional(),
  locale: z.enum(["mr", "hi", "en"]),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = await createOrder({
    ...parsed.data,
    userId: session.userId,
    phone: session.phone.replace("+91", ""),
  });

  if (!result.ok) {
    const status = result.error === "delivery_out_of_zone" ? 400 : result.error === "out_of_stock" ? 409 : 400;
    return NextResponse.json({ error: result.error, sku: "sku" in result ? result.sku : undefined }, { status });
  }

  return NextResponse.json({ ok: true, order: result.order });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
}
