import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import Farmer from "@/lib/models/Farmer";
import { notify } from "@/lib/notifications/notify";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  amountPaid: z.number().min(0),
  paymentMode: z.enum(["cash", "upi", "bank_transfer"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireOwner();
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

  const newAmountPaid = receipt.amountPaid + parsed.data.amountPaid;
  receipt.amountPaid = Math.min(newAmountPaid, receipt.totalAmount);
  receipt.paymentStatus = receipt.amountPaid >= receipt.totalAmount ? "paid" : "partial";
  await receipt.save();

  const farmer = await Farmer.findById(receipt.farmerId);
  if (farmer) {
    await notify({
      type: "payment_confirmation",
      phone: farmer.phone,
      amount: parsed.data.amountPaid,
      paymentMode: parsed.data.paymentMode,
    });
  }

  await logAudit({
    userId: session.userId,
    action: "payment_marked_paid",
    targetType: "GoodsReceipt",
    targetId: id,
    details: { amountPaid: parsed.data.amountPaid, paymentMode: parsed.data.paymentMode },
  });

  return NextResponse.json({ ok: true, receipt: receipt.toObject() });
}
