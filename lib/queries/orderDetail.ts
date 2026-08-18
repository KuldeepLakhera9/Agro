import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import type { SessionPayload } from "@/lib/auth/session";

export async function getOrderForViewer(orderId: string, session: SessionPayload) {
  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order) return null;
  if (!session.isAdmin && String(order.userId) !== session.userId) return null;
  return JSON.parse(JSON.stringify(order));
}
