import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  role: z.enum(["staff", "customer"]),
});

export async function GET() {
  const { session, response } = await requireOwner();
  if (!session) return response;

  await connectDB();
  const users = await User.find({ role: { $in: ["staff", "owner"] } }).sort({ role: 1 }).lean();
  return NextResponse.json({ users: JSON.parse(JSON.stringify(users)) });
}

// Grants or revokes staff access by phone. Owners are only ever set via the
// ADMIN_PHONES env var on login (lib/auth/adminAllowlist.ts) — this route
// deliberately can't mint another owner, only staff.
export async function POST(request: NextRequest) {
  const { session, response } = await requireOwner();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await connectDB();
  const fullPhone = `+91${parsed.data.phone}`;
  const user = await User.findOneAndUpdate(
    { phone: fullPhone },
    { $setOnInsert: { phone: fullPhone }, $set: { role: parsed.data.role } },
    { upsert: true, returnDocument: "after" },
  );

  await logAudit({
    userId: session.userId,
    action: "user_role_changed",
    targetType: "User",
    targetId: String(user._id),
    details: { phone: fullPhone, role: parsed.data.role },
  });

  return NextResponse.json({ ok: true, user: user.toObject() });
}
