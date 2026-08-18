import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";

export default async function OrdersListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}`);

  const t = await getTranslations("Orders");
  await connectDB();
  const orders = await Order.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-foreground/60">{t("noOrders")}</p>
      ) : (
        <div className="mt-6 divide-y divide-brand-100 rounded-2xl border border-brand-100">
          {orders.map((o) => (
            <Link
              key={String(o._id)}
              href={`/orders/${o._id}`}
              className="flex items-center justify-between p-4 hover:bg-brand-50"
            >
              <div>
                <p className="font-medium text-foreground">
                  {t("orderNumber", { id: o.orderRef.slice(0, 8).toUpperCase() })}
                </p>
                <p className="text-sm text-foreground/60">
                  {t("placedOn", { date: new Date(o.createdAt).toLocaleDateString() })}
                </p>
                <p className="text-sm font-medium text-brand-700">
                  {t(`status_${o.status}` as never)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-800">{formatPrice(o.total)}</p>
                <span className="text-sm text-brand-600">{t("viewDetails")} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
