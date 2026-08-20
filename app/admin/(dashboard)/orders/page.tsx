import Link from "next/link";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Order, { ORDER_STATUSES } from "@/lib/models/Order";
import { formatPrice } from "@/lib/format";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await connectDB();
  const [t, tStatus] = await Promise.all([
    getAdminTranslations("Admin.Orders"),
    getAdminTranslations("Orders"),
  ]);

  const query: Record<string, unknown> = {};
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    query.status = status;
  }
  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            !status ? "bg-brand-600 text-white" : "bg-white text-foreground/70"
          }`}
        >
          {t("all")}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === s ? "bg-brand-600 text-white" : "bg-white text-foreground/70"
            }`}
          >
            {tStatus(`status_${s}` as never)}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{t("colOrder")}</th>
              <th className="px-4 py-3">{t("colPlaced")}</th>
              <th className="px-4 py-3">{t("colStatus")}</th>
              <th className="px-4 py-3">{t("colPayment")}</th>
              <th className="px-4 py-3 text-right">{t("colTotal")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {orders.map((o) => (
              <tr key={String(o._id)} className="hover:bg-earth-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o._id}`} className="font-medium text-brand-700 hover:underline">
                    {o.orderRef.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {tStatus(`status_${o.status}` as never)}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  COD {o.paymentStatus === "paid" ? "· paid" : ""}
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noOrders")}</p>
        )}
      </div>
    </div>
  );
}
