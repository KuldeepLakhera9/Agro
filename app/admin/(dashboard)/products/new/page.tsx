import { getAdminTranslations } from "@/lib/adminLocale";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const t = await getAdminTranslations("Admin.Catalog");
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("newProductTitle")}</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
