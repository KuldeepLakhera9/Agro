import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PurchaseRequest from "@/lib/models/PurchaseRequest";

// Deliberately public (no farmer auth) — the link is sent privately via SMS
// and the id is an unguessable ObjectId. Only exposes what a farmer needs
// to decide whether to respond; offer submission itself requires OTP.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();
  const pr = await PurchaseRequest.findOne({ _id: id, status: { $in: ["sent", "partially_fulfilled"] } }).lean();
  if (!pr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    request: {
      id: String(pr._id),
      productName: pr.product.name,
      quantityNeeded: pr.quantityNeeded,
      unit: pr.unit,
      targetPricePerUnit: pr.targetPricePerUnit,
      neededBy: pr.neededBy,
    },
  });
}
