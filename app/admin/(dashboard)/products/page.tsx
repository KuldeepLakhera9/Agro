import Link from "next/link";
import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { formatPrice } from "@/lib/format";
import { pick } from "@/lib/localizedField";

export default async function AdminProductsPage() {
  await connectDB();
  const [products, locale, t] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean(),
    getAdminLocale(),
    getAdminTranslations("Admin.Catalog"),
  ]);
  const tCommon = await getAdminTranslations("Admin.Common");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("addProduct")}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{t("colName")}</th>
              <th className="px-4 py-3">{t("colCategory")}</th>
              <th className="px-4 py-3">{t("colVariants")}</th>
              <th className="px-4 py-3">{t("colStatus")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {products.map((p) => (
              <tr key={String(p._id)} className="hover:bg-earth-50">
                <td className="px-4 py-3 font-medium">{pick(p.name, locale)}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.category === "oil" ? t("categoryOil") : t("categoryGrain")}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.variants
                    .map((v: { size: string; price: number; stock: number }) => `${v.size} (${formatPrice(v.price)}, stock ${v.stock})`)
                    .join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isActive ? "bg-brand-50 text-brand-700" : "bg-earth-100 text-earth-500"
                    }`}
                  >
                    {p.isActive ? tCommon("active") : tCommon("inactive")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="text-brand-600 hover:underline"
                  >
                    {tCommon("edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
