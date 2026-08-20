import Link from "next/link";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";

export default async function AdminFarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await connectDB();
  const [t, tCommon] = await Promise.all([
    getAdminTranslations("Admin.Farmers"),
    getAdminTranslations("Admin.Common"),
  ]);

  const query: Record<string, unknown> = {};
  if (q) {
    const re = new RegExp(q, "i");
    query.$or = [{ name: re }, { village: re }, { phone: re }];
  }
  const farmers = await Farmer.find(query).sort({ name: 1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>
        <Link
          href="/admin/farmers/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("addFarmer")}
        </Link>
      </div>

      <form className="mt-4" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-sm rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{tCommon("name")}</th>
              <th className="px-4 py-3">{t("colVillage")}</th>
              <th className="px-4 py-3">{tCommon("phone")}</th>
              <th className="px-4 py-3">{t("colSupplies")}</th>
              <th className="px-4 py-3">{t("colRating")}</th>
              <th className="px-4 py-3">{tCommon("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {farmers.map((f) => (
              <tr key={String(f._id)} className="hover:bg-earth-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/farmers/${f._id}`} className="font-medium text-brand-700 hover:underline">
                    {f.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/70">{f.village || "—"}</td>
                <td className="px-4 py-3 text-foreground/70">{f.phone}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {f.suppliedProducts.map((sp: { productName: string }) => sp.productName).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {f.rating ? `★ ${f.rating.toFixed(1)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      f.isActive ? "bg-brand-50 text-brand-700" : "bg-earth-100 text-earth-500"
                    }`}
                  >
                    {f.isActive ? tCommon("active") : tCommon("inactive")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {farmers.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noFarmers")}</p>
        )}
      </div>
    </div>
  );
}
