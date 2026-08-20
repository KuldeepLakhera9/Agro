import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { pick } from "@/lib/localizedField";
import PurchaseRequestForm from "@/components/admin/PurchaseRequestForm";

export default async function NewPurchaseRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  await connectDB();
  const [products, locale, t] = await Promise.all([
    Product.find({ isActive: true }).lean(),
    getAdminLocale(),
    getAdminTranslations("Admin.Procurement"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("newRequestTitle")}</h1>
      <div className="mt-6">
        <PurchaseRequestForm
          products={products.map((p) => ({ _id: String(p._id), name: pick(p.name, locale) }))}
          initialProductId={productId}
        />
      </div>
    </div>
  );
}
