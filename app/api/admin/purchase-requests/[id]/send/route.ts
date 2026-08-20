import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import Farmer from "@/lib/models/Farmer";
import { notify } from "@/lib/notifications/notify";
import { logAudit } from "@/lib/audit/log";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  await connectDB();
  const pr = await PurchaseRequest.findById(id);
  if (!pr) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (pr.sentTo.length === 0) {
    return NextResponse.json({ error: "no_farmers_selected" }, { status: 400 });
  }

  const farmers = await Farmer.find({ _id: { $in: pr.sentTo } });
  const link = `${request.nextUrl.origin}/farmer/offer?requestId=${pr._id}`;

  for (const farmer of farmers) {
    await notify({
      type: "purchase_request_sent",
      phone: farmer.phone,
      productName: pr.product.name,
      quantity: pr.quantityNeeded,
      unit: pr.unit,
      targetPrice: pr.targetPricePerUnit ?? 0,
      neededBy: pr.neededBy ? pr.neededBy.toLocaleDateString() : "—",
      link,
    });
  }

  pr.status = "sent";
  await pr.save();

  await logAudit({
    userId: session.userId,
    action: "purchase_request_sent",
    targetType: "PurchaseRequest",
    targetId: id,
    details: { farmerCount: farmers.length },
  });

  return NextResponse.json({ ok: true });
}
