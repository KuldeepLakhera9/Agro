import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFarmerSession } from "@/lib/auth/farmerSession";
import { connectDB } from "@/lib/db";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import FarmerOffer from "@/lib/models/FarmerOffer";
import Farmer from "@/lib/models/Farmer";
import { notify } from "@/lib/notifications/notify";

const schema = z.object({
  purchaseRequestId: z.string(),
  quantityAvailable: z.number().positive(),
  pricePerUnit: z.number().positive(),
  readyByDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getFarmerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await connectDB();
  const purchaseRequest = await PurchaseRequest.findOne({
    _id: parsed.data.purchaseRequestId,
    status: { $in: ["sent", "partially_fulfilled"] },
  });
  if (!purchaseRequest) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!purchaseRequest.sentTo.some((f: unknown) => String(f) === session.farmerId)) {
    return NextResponse.json({ error: "not_invited" }, { status: 403 });
  }

  const offer = await FarmerOffer.findOneAndUpdate(
    { purchaseRequestId: purchaseRequest._id, farmerId: session.farmerId },
    {
      $set: {
        quantityAvailable: parsed.data.quantityAvailable,
        pricePerUnit: parsed.data.pricePerUnit,
        readyByDate: parsed.data.readyByDate ? new Date(parsed.data.readyByDate) : undefined,
        status: "submitted",
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  if (!purchaseRequest.responses.some((r: { farmerId: unknown }) => String(r.farmerId) === session.farmerId)) {
    purchaseRequest.responses.push({ farmerId: session.farmerId, offerId: offer._id });
    await purchaseRequest.save();
  }

  const farmerDoc = await Farmer.findById(session.farmerId);
  const farmerName = farmerDoc?.name ?? "Farmer";
  await notify({
    type: "new_offer_received",
    farmerName,
    productName: purchaseRequest.product.name,
    quantity: parsed.data.quantityAvailable,
    unit: purchaseRequest.unit,
    pricePerUnit: parsed.data.pricePerUnit,
  });

  return NextResponse.json({ ok: true, offerId: String(offer._id) });
}
