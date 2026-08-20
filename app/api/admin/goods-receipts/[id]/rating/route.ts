import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import Farmer from "@/lib/models/Farmer";

const schema = z.object({
  score: z.number().min(1).max(5),
  onTime: z.boolean(),
  qualityMatch: z.boolean(),
  honestQuantity: z.boolean(),
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
  const receipt = await GoodsReceipt.findById(id);
  if (!receipt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  receipt.rating = parsed.data;
  await receipt.save();

  const farmer = await Farmer.findById(receipt.farmerId);
  if (farmer) {
    const prevTotal = (farmer.rating ?? 0) * farmer.ratingCount;
    farmer.ratingCount += 1;
    farmer.rating = (prevTotal + parsed.data.score) / farmer.ratingCount;
    await farmer.save();
  }

  return NextResponse.json({ ok: true });
}
