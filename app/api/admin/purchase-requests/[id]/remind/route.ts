import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import Farmer from "@/lib/models/Farmer";
import { notify } from "@/lib/notifications/notify";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({ farmerId: z.string() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await connectDB();
  const pr = await PurchaseRequest.findById(id);
  if (!pr) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const farmer = await Farmer.findById(parsed.data.farmerId);
  if (!farmer) return NextResponse.json({ error: "farmer_not_found" }, { status: 404 });

  const link = `${request.nextUrl.origin}/farmer/offer?requestId=${pr._id}`;
  await notify({
    type: "purchase_request_reminder",
    phone: farmer.phone,
    productName: pr.product.name,
    link,
  });

  pr.remindedAt.set(parsed.data.farmerId, new Date());
  await pr.save();

  await logAudit({
    userId: session.userId,
    action: "purchase_request_reminder_sent",
    targetType: "PurchaseRequest",
    targetId: id,
    details: { farmerId: parsed.data.farmerId },
  });

  return NextResponse.json({ ok: true });
}
