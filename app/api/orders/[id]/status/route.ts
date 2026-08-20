import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import Order, { ORDER_STATUSES } from "@/lib/models/Order";
import { notify } from "@/lib/notifications/notify";

const schema = z.object({
  status: z.enum(ORDER_STATUSES),
  driverName: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  order.status = parsed.data.status;
  order.statusHistory.push({ status: parsed.data.status, at: new Date() });
  if (parsed.data.driverName) order.driverName = parsed.data.driverName;
  if (parsed.data.status === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }
  await order.save();

  await notify({
    type: "order_status_changed",
    phone: order.address?.phone ?? "",
    orderRef: order.orderRef,
    status: parsed.data.status,
  });

  return NextResponse.json({ ok: true, order: order.toObject() });
}
