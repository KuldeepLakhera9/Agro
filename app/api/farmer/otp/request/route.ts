import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/auth/otpProvider";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";

const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  await connectDB();
  const farmer = await Farmer.findOne({ phone: parsed.data.phone, isActive: true });
  if (!farmer) {
    return NextResponse.json({ error: "not_registered" }, { status: 404 });
  }

  const { devCode } = await requestOtp(parsed.data.phone);
  return NextResponse.json({ ok: true, devCode });
}
