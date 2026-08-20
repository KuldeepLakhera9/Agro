import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { pick } from "@/lib/localizedField";
import FarmerForm from "@/components/admin/FarmerForm";

export default async function NewFarmerPage() {
  await connectDB();
  const [products, locale, t] = await Promise.all([
    Product.find({ isActive: true }).lean(),
    getAdminLocale(),
    getAdminTranslations("Admin.Farmers"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("newFarmerTitle")}</h1>
      <div className="mt-6">
        <FarmerForm products={products.map((p) => ({ _id: String(p._id), name: pick(p.name, locale) }))} />
      </div>
    </div>
  );
}
