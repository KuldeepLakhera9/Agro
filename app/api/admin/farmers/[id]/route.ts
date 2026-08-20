import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  suppliedProducts: z.array(z.object({ productId: z.string(), productName: z.string() })),
  preferredPaymentMode: z.enum(["cash", "upi", "bank_transfer"]),
  upiId: z.string().optional(),
  bankDetails: z
    .object({
      accountNumber: z.string().optional(),
      ifsc: z.string().optional(),
      accountHolder: z.string().optional(),
    })
    .optional(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  notes: z.string().optional(),
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
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  }

  await connectDB();
  try {
    // $set, not a plain replacement object — a plain object here would make
    // MongoDB replace the whole document, silently wiping fields this form
    // doesn't send (rating/ratingCount, set only via the goods-receipt
    // rating route).
    const farmer = await Farmer.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" });
    if (!farmer) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await logAudit({
      userId: session.userId,
      action: "farmer_updated",
      targetType: "Farmer",
      targetId: id,
      details: { name: farmer.name },
    });

    return NextResponse.json({ ok: true, farmer: farmer.toObject() });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "duplicate_phone" }, { status: 409 });
    }
    throw err;
  }
}
