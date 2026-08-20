import { notFound } from "next/navigation";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { formatPrice } from "@/lib/format";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) notFound();
  const customer = await User.findById(order.userId).lean();
  const [t, tStatus] = await Promise.all([
    getAdminTranslations("Admin.Orders"),
    getAdminTranslations("Orders"),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">
          {t("orderHeading", { ref: order.orderRef.slice(0, 8).toUpperCase() })}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {t("placedByLine", {
            date: new Date(order.createdAt).toLocaleString(),
            phone: customer?.phone ?? "—",
          })}
        </p>

        <div className="mt-6 rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("items")}</h2>
          <div className="mt-3 divide-y divide-earth-100">
            {order.items.map((item: { sku: string; name: string; size: string; price: number; qty: number }) => (
              <div key={item.sku} className="flex justify-between py-2 text-sm">
                <span>
                  {item.name} ({item.size}) × {item.qty}
                </span>
                <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-earth-100 pt-3 font-bold text-brand-800">
            <span>{t("total")}</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("delivery")}</h2>
          <p className="mt-2 text-sm text-foreground/70">
            {order.deliveryMethod === "home_delivery" ? t("homeDelivery") : t("storePickup")}
          </p>
          {order.address && (
            <p className="mt-2 text-sm text-foreground/70">
              {order.address.fullName}
              <br />
              {order.address.line}, {order.address.city}
              <br />
              {order.address.state} — {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
          )}
          {order.driverName && (
            <p className="mt-2 text-sm text-foreground/70">
              {t("driverLine", { name: order.driverName })}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("statusHistory")}</h2>
          <div className="mt-3 space-y-1">
            {order.statusHistory.map((h: { status: string; at: string }, i: number) => (
              <p key={i} className="text-sm text-foreground/70">
                <span className="font-medium text-foreground">
                  {tStatus(`status_${h.status}` as never)}
                </span>{" "}
                — {new Date(h.at).toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      </div>

      <OrderStatusUpdater
        orderId={String(order._id)}
        currentStatus={order.status}
        currentDriver={order.driverName}
      />
    </div>
  );
}
