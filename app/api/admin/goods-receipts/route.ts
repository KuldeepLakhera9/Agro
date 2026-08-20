import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createGoodsReceipt } from "@/lib/queries/goodsReceipts";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  farmerOfferId: z.string(),
  quantityReceived: z.number().positive(),
  pricePerUnit: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = await createGoodsReceipt({ ...parsed.data, recordedBy: session.userId });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit({
    userId: session.userId,
    action: "goods_receipt_recorded",
    targetType: "GoodsReceipt",
    targetId: result.receiptId,
    details: parsed.data,
  });

  return NextResponse.json({ ok: true, receiptId: result.receiptId });
}
