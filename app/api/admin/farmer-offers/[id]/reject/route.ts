import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import FarmerOffer from "@/lib/models/FarmerOffer";
import { logAudit } from "@/lib/audit/log";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  await connectDB();
  const offer = await FarmerOffer.findByIdAndUpdate(id, { status: "rejected" }, { returnDocument: "after" });
  if (!offer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await logAudit({
    userId: session.userId,
    action: "farmer_offer_rejected",
    targetType: "FarmerOffer",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
