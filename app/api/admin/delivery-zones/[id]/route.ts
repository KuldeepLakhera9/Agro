import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import DeliveryZone from "@/lib/models/DeliveryZone";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireOwner();
  if (!session) return response;

  const { id } = await params;
  await connectDB();
  await DeliveryZone.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
