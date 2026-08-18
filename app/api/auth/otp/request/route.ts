import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/auth/otpProvider";

const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const { devCode } = await requestOtp(parsed.data.phone);
  return NextResponse.json({ ok: true, devCode });
}
