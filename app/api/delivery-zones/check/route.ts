import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isPincodeServiceable } from "@/lib/queries/deliveryZones";

const schema = z.object({ pincode: z.string().regex(/^\d{6}$/) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_pincode" }, { status: 400 });
  }

  const deliverable = await isPincodeServiceable(parsed.data.pincode);
  return NextResponse.json({ deliverable });
}
