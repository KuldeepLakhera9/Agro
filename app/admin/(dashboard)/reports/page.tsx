import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";
import { connectDB } from "@/lib/db";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import Order from "@/lib/models/Order";
import Farmer from "@/lib/models/Farmer";
import { formatPrice } from "@/lib/format";

export default async function ReportsPage() {
  await requireOwnerPage();
  await connectDB();
  const t = await getAdminTranslations("Admin.Reports");

  const [recentReceipts, recentOrders, farmers] = await Promise.all([
    GoodsReceipt.find().sort({ receivedAt: -1 }).limit(10).populate("farmerId", "name").lean(),
    Order.find({ status: { $ne: "cancelled" } }).sort({ createdAt: -1 }).limit(10).lean(),
    Farmer.find({ ratingCount: { $gt: 0 } }).sort({ rating: -1 }).lean(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("recentReceipts")}</h2>
          <div className="mt-3 divide-y divide-earth-100">
            {recentReceipts.map((r) => (
              <div key={String(r._id)} className="py-2 text-sm">
                <div className="flex justify-between">
                  <span>+{r.quantityReceived} {r.unit}</span>
                  <span className="text-foreground/60">{new Date(r.receivedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-foreground/50">
                  {(r.farmerId as unknown as { name?: string })?.name ?? "—"} · {formatPrice(r.totalAmount)}
                </p>
              </div>
            ))}
            {recentReceipts.length === 0 && (
              <p className="py-4 text-center text-sm text-foreground/50">{t("noReceipts")}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("recentOrders")}</h2>
          <div className="mt-3 divide-y divide-earth-100">
            {recentOrders.map((o) => (
              <div key={String(o._id)} className="py-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("unitsSold", { count: o.items.reduce((s: number, i: { qty: number }) => s + i.qty, 0) })}</span>
                  <span className="text-foreground/60">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-foreground/50">
                  {o.orderRef.slice(0, 8).toUpperCase()} · {formatPrice(o.total)}
                </p>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="py-4 text-center text-sm text-foreground/50">{t("noOrders")}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-earth-200 bg-white p-5 lg:col-span-2">
          <h2 className="font-semibold text-foreground">{t("reliability")}</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-earth-200 text-left text-foreground/50">
              <tr>
                <th className="py-2">{t("colFarmer")}</th>
                <th className="py-2">{t("colVillage")}</th>
                <th className="py-2">{t("colRating")}</th>
                <th className="py-2">{t("colDeliveriesRated")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {farmers.map((f) => (
                <tr key={String(f._id)}>
                  <td className="py-2">{f.name}</td>
                  <td className="py-2 text-foreground/70">{f.village || "—"}</td>
                  <td className="py-2">★ {f.rating?.toFixed(1)}</td>
                  <td className="py-2 text-foreground/70">{f.ratingCount}</td>
                </tr>
              ))}
              {farmers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-foreground/50">
                    {t("noRatedDeliveries")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
