import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otpProvider";
import { createFarmerSession } from "@/lib/auth/farmerSession";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const { phone, code } = parsed.data;
  const result = await verifyOtp(phone, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  await connectDB();
  const farmer = await Farmer.findOne({ phone, isActive: true });
  if (!farmer) {
    return NextResponse.json({ error: "not_registered" }, { status: 404 });
  }

  await createFarmerSession({ farmerId: String(farmer._id), phone: farmer.phone });

  return NextResponse.json({ ok: true, farmerName: farmer.name });
}
