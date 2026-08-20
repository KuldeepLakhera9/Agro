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

export async function GET(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  await connectDB();
  const q = request.nextUrl.searchParams.get("q");
  const productId = request.nextUrl.searchParams.get("productId");
  const query: Record<string, unknown> = {};
  if (q) {
    const re = new RegExp(q, "i");
    query.$or = [{ name: re }, { village: re }, { phone: re }];
  }
  if (productId) query["suppliedProducts.productId"] = productId;

  const farmers = await Farmer.find(query).sort({ name: 1 }).lean();
  return NextResponse.json({ farmers: JSON.parse(JSON.stringify(farmers)) });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  }

  await connectDB();
  try {
    const farmer = await Farmer.create(parsed.data);
    await logAudit({
      userId: session.userId,
      action: "farmer_created",
      targetType: "Farmer",
      targetId: String(farmer._id),
      details: { name: farmer.name, phone: farmer.phone },
    });
    return NextResponse.json({ ok: true, farmer: farmer.toObject() });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "duplicate_phone" }, { status: 409 });
    }
    throw err;
  }
}
