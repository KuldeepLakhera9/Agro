import { notFound } from "next/navigation";
import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";
import Product from "@/lib/models/Product";
import { pick } from "@/lib/localizedField";
import DirectPurchaseForm from "@/components/admin/DirectPurchaseForm";

export default async function DirectPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const [farmer, products, locale, t] = await Promise.all([
    Farmer.findById(id).lean(),
    Product.find({ isActive: true }).lean(),
    getAdminLocale(),
    getAdminTranslations("Admin.Farmers"),
  ]);
  if (!farmer) notFound();

  const suppliedIds = new Set(
    farmer.suppliedProducts.map((sp: { productId: { toString(): string } }) => sp.productId.toString()),
  );
  const sorted = [...products].sort((a, b) => {
    const aSupplies = suppliedIds.has(String(a._id)) ? 0 : 1;
    const bSupplies = suppliedIds.has(String(b._id)) ? 0 : 1;
    return aSupplies - bSupplies;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("recordPurchaseFrom", { name: farmer.name })}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("phoneCallNote")}</p>
      <div className="mt-6">
        <DirectPurchaseForm
          farmerId={id}
          products={sorted.map((p) => ({ _id: String(p._id), name: pick(p.name, locale) }))}
        />
      </div>
    </div>
  );
}
