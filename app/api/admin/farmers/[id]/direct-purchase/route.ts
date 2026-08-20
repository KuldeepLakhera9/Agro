import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createDirectPurchase } from "@/lib/queries/directPurchase";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  unit: z.enum(["kg", "quintal"]),
  pricePerUnit: z.number().positive(),
});

export async function POST(
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

  const result = await createDirectPurchase({
    farmerId: id,
    ...parsed.data,
    createdBy: session.userId,
  });

  if (!result.ok) {
    const status = result.error === "farmer_not_found" || result.error === "product_not_found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  await logAudit({
    userId: session.userId,
    action: "goods_receipt_recorded",
    targetType: "GoodsReceipt",
    targetId: result.receiptId,
    details: { ...parsed.data, farmerId: id, direct: true },
  });

  return NextResponse.json({ ok: true, receiptId: result.receiptId });
}
