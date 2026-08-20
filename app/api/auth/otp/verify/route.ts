import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otpProvider";
import { createSession } from "@/lib/auth/session";
import { isOwnerPhone } from "@/lib/auth/adminAllowlist";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

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
  // ADMIN_PHONES always wins the "owner" role on every login. Otherwise
  // leave role untouched on an existing user — staff roles are granted via
  // /admin/settings/users and must never be silently reset to "customer"
  // just because someone logged back in.
  const update = isOwnerPhone(phone)
    ? { $setOnInsert: { phone: `+91${phone}` }, $set: { role: "owner" as const } }
    : { $setOnInsert: { phone: `+91${phone}` } };

  const user = await User.findOneAndUpdate({ phone: `+91${phone}` }, update, {
    upsert: true,
    returnDocument: "after",
  });

  await createSession({
    userId: String(user._id),
    phone: user.phone,
    role: user.role,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
