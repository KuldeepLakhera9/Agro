import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import DeliveryZone from "@/lib/models/DeliveryZone";

const schema = z.object({
  pincode: z.string().regex(/^\d{6}$/),
  area: z.string().min(1),
});

export async function GET() {
  const { session, response } = await requireOwner();
  if (!session) return response;

  await connectDB();
  const zones = await DeliveryZone.find().sort({ pincode: 1 }).lean();
  return NextResponse.json({ zones: JSON.parse(JSON.stringify(zones)) });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireOwner();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await connectDB();
  try {
    const zone = await DeliveryZone.create(parsed.data);
    return NextResponse.json({ ok: true, zone: zone.toObject() });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "duplicate_pincode" }, { status: 409 });
    }
    throw err;
  }
}
