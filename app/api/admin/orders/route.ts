import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import Order, { ORDER_STATUSES } from "@/lib/models/Order";

export async function GET(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  await connectDB();
  const status = request.nextUrl.searchParams.get("status");
  const query: Record<string, unknown> = {};
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    query.status = status;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
}
