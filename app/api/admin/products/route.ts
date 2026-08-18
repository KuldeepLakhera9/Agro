import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

const localizedString = z.object({ mr: z.string().min(1), hi: z.string().min(1), en: z.string().min(1) });

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localizedString,
  category: z.enum(["oil", "grain"]),
  description: localizedString,
  badges: z.array(z.enum(["chemical_free", "cold_pressed", "grade_1"])),
  images: z.array(z.string()),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        size: z.string().min(1),
        unitLabel: z.string().min(1),
        price: z.number().min(0),
        stock: z.number().int().min(0),
      }),
    )
    .min(1),
  isActive: z.boolean(),
});

export async function GET() {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 });
  }

  await connectDB();
  try {
    const product = await Product.create(parsed.data);
    return NextResponse.json({ ok: true, product: product.toObject() });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "duplicate_slug_or_sku" }, { status: 409 });
    }
    throw err;
  }
}
