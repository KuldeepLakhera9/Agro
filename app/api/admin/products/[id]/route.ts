import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { productSchema } from "@/lib/validation/product";
import { notify } from "@/lib/notifications/notify";
import { pick } from "@/lib/localizedField";
import { logAudit } from "@/lib/audit/log";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  }

  await connectDB();
  try {
    // $set, not a plain replacement object — a plain object here would make
    // MongoDB replace the whole document, silently wiping any field this
    // form doesn't send (a real bug this project hit: edited products lost
    // their rawStock because the form's payload didn't include it yet).
    const product = await Product.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" });
    if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await logAudit({
      userId: session.userId,
      action: "product_stock_edited",
      targetType: "Product",
      targetId: id,
      details: { rawStock: product.rawStock },
    });

    if (product.rawStock && product.rawStock.quantity < product.rawStock.lowStockThreshold) {
      await notify({
        type: "low_stock_alert",
        productName: pick(product.name, "en"),
        quantity: product.rawStock.quantity,
        unit: product.rawStock.unit,
        threshold: product.rawStock.lowStockThreshold,
      });
    }

    return NextResponse.json({ ok: true, product: product.toObject() });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "duplicate_slug_or_sku" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const { id } = await params;
  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
