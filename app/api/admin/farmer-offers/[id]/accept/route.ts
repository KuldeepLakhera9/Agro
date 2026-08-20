import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import FarmerOffer from "@/lib/models/FarmerOffer";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import Farmer from "@/lib/models/Farmer";
import { notify } from "@/lib/notifications/notify";
import { logAudit } from "@/lib/audit/log";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  await connectDB();
  const offer = await FarmerOffer.findById(id);
  if (!offer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  offer.status = "accepted";
  await offer.save();

  const pr = await PurchaseRequest.findById(offer.purchaseRequestId);
  if (pr) {
    const acceptedOffers = await FarmerOffer.find({
      purchaseRequestId: pr._id,
      status: "accepted",
    });
    const acceptedQty = acceptedOffers.reduce((sum, o) => sum + o.quantityAvailable, 0);
    pr.status = acceptedQty >= pr.quantityNeeded ? "fulfilled" : "partially_fulfilled";
    await pr.save();

    const farmer = await Farmer.findById(offer.farmerId);
    if (farmer) {
      await notify({
        type: "offer_accepted",
        phone: farmer.phone,
        productName: pr.product.name,
        quantity: offer.quantityAvailable,
        unit: pr.unit,
        pricePerUnit: offer.pricePerUnit,
        readyByDate: offer.readyByDate ? offer.readyByDate.toLocaleDateString() : "—",
      });
    }
  }

  await logAudit({
    userId: session.userId,
    action: "farmer_offer_accepted",
    targetType: "FarmerOffer",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
