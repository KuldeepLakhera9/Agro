import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { pick } from "@/lib/localizedField";

export async function getLowStockProducts(locale: string = "en") {
  await connectDB();
  const products = await Product.find({
    isActive: true,
    $expr: { $lt: ["$rawStock.quantity", "$rawStock.lowStockThreshold"] },
    "rawStock.lowStockThreshold": { $gt: 0 },
  }).lean();

  return products.map((p) => ({
    _id: String(p._id),
    name: pick(p.name, locale),
    quantity: p.rawStock.quantity,
    unit: p.rawStock.unit,
    threshold: p.rawStock.lowStockThreshold,
  }));
}
