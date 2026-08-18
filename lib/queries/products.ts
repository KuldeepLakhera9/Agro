import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import type { LocalizedString } from "@/lib/localizedField";

export interface ProductVariant {
  sku: string;
  size: string;
  unitLabel: string;
  price: number;
  stock: number;
}

export interface PlainProduct {
  _id: string;
  slug: string;
  name: LocalizedString;
  category: "oil" | "grain";
  description: LocalizedString;
  badges: string[];
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
}

function toPlain(doc: unknown): PlainProduct {
  return JSON.parse(JSON.stringify(doc));
}

export async function getActiveProducts(filters?: {
  category?: "oil" | "grain";
  search?: string;
}) {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true };
  if (filters?.category) query.category = filters.category;
  if (filters?.search) {
    const re = new RegExp(filters.search, "i");
    query.$or = [
      { "name.mr": re },
      { "name.hi": re },
      { "name.en": re },
      { slug: re },
    ];
  }
  const docs = await Product.find(query).sort({ createdAt: -1 }).lean();
  return docs.map(toPlain);
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const doc = await Product.findOne({ slug, isActive: true }).lean();
  return doc ? toPlain(doc) : null;
}

export async function getRelatedProducts(category: string, excludeSlug: string) {
  await connectDB();
  const docs = await Product.find({
    isActive: true,
    category,
    slug: { $ne: excludeSlug },
  })
    .limit(4)
    .lean();
  return docs.map(toPlain);
}

export function priceRange(product: PlainProduct) {
  const prices = product.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function totalStock(product: PlainProduct) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}
