import Link from "next/link";
import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { getAdminSummary } from "@/lib/queries/adminSummary";
import { getLowStockProducts } from "@/lib/queries/lowStock";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const locale = await getAdminLocale();
  const [summary, lowStock, t] = await Promise.all([
    getAdminSummary(),
    getLowStockProducts(locale),
    getAdminTranslations("Admin.Dashboard"),
  ]);

  const cards = [
    { label: t("today"), stat: summary.today },
    { label: t("last7Days"), stat: summary.week },
    { label: t("last30Days"), stat: summary.month },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-earth-200 bg-white p-5">
            <p className="text-sm font-medium text-foreground/60">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-800">
              {formatPrice(c.stat.revenue)}
            </p>
            <p className="text-sm text-foreground/50">{t("ordersSuffix", { count: c.stat.count })}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">{t("lowStockTitle")}</h2>
          <div className="mt-3 divide-y divide-amber-200">
            {lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-amber-900">
                  {t("lowStockLine", {
                    name: p.name,
                    quantity: p.quantity,
                    unit: p.unit,
                    threshold: p.threshold,
                  })}
                </span>
                <Link
                  href={`/admin/procurement/purchase-requests/new?productId=${p._id}`}
                  className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  {t("draftPurchaseRequest")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-earth-200 bg-white p-5">
        <h2 className="font-semibold text-foreground">{t("topProducts")}</h2>
        {summary.topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">{t("noSales")}</p>
        ) : (
          <div className="mt-3 divide-y divide-earth-100">
            {summary.topProducts.map((p) => (
              <div key={p._id} className="flex justify-between py-2 text-sm">
                <span className="text-foreground/80">
                  {p._id} × {p.qty}
                </span>
                <span className="font-semibold text-brand-700">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
