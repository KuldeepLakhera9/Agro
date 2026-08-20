import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import PurchaseRequest, { PURCHASE_REQUEST_STATUSES } from "@/lib/models/PurchaseRequest";
import Product from "@/lib/models/Product";
import { logAudit } from "@/lib/audit/log";

const schema = z.object({
  productId: z.string(),
  quantityNeeded: z.number().positive(),
  unit: z.enum(["kg", "quintal"]),
  targetPricePerUnit: z.number().positive().optional(),
  neededBy: z.string().optional(),
  farmerIds: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  await connectDB();
  const status = request.nextUrl.searchParams.get("status");
  const query: Record<string, unknown> = {};
  if (status && (PURCHASE_REQUEST_STATUSES as readonly string[]).includes(status)) {
    query.status = status;
  }
  const requests = await PurchaseRequest.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ requests: JSON.parse(JSON.stringify(requests)) });
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
  const product = await Product.findById(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  const pr = await PurchaseRequest.create({
    product: { productId: product._id, name: product.name.mr },
    quantityNeeded: parsed.data.quantityNeeded,
    unit: parsed.data.unit,
    targetPricePerUnit: parsed.data.targetPricePerUnit,
    neededBy: parsed.data.neededBy ? new Date(parsed.data.neededBy) : undefined,
    sentTo: parsed.data.farmerIds,
    status: "draft",
    createdBy: session.userId,
  });

  await logAudit({
    userId: session.userId,
    action: "purchase_request_created",
    targetType: "PurchaseRequest",
    targetId: String(pr._id),
    details: { product: product.name.en, quantityNeeded: parsed.data.quantityNeeded },
  });

  return NextResponse.json({ ok: true, request: pr.toObject() });
}
