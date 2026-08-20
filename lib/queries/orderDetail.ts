import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import type { SessionPayload } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/roles";

export async function getOrderForViewer(orderId: string, session: SessionPayload) {
  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order) return null;
  const isAdmin = (ADMIN_ROLES as readonly string[]).includes(session.role);
  if (!isAdmin && String(order.userId) !== session.userId) return null;
  return JSON.parse(JSON.stringify(order));
}
