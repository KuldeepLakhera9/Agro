import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getOrderForViewer } from "@/lib/queries/orderDetail";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { formatPrice } from "@/lib/format";
import StatusTimeline from "@/components/orders/StatusTimeline";
import ReorderButton from "@/components/orders/ReorderButton";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { locale, id } = await params;
  const { new: isNew } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/${locale}`);

  const order = await getOrderForViewer(id, session).catch(() => null);
  if (!order) notFound();

  const t = await getTranslations("Orders");
  const tc = await getTranslations("OrderConfirmation");
  const tCheckout = await getTranslations("Checkout");
  const tCart = await getTranslations("Cart");

  await connectDB();
  const productIds = order.items.map((i: { productId: string }) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const slugsBySku: Record<string, string> = {};
  for (const p of products) {
    for (const v of p.variants) {
      slugsBySku[v.sku] = p.slug;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {isNew === "1" && (
        <div className="mb-6 rounded-xl bg-brand-50 p-5 text-center">
          <p className="text-xl font-bold text-brand-800">{tc("title")}</p>
          <p className="mt-1 text-sm text-brand-700">
            {tc("thankYou", { name: order.address?.fullName ?? "" })}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">
          {t("orderNumber", { id: order.orderRef.slice(0, 8).toUpperCase() })}
        </h1>
        <ReorderButton items={order.items} productSlugs={slugsBySku} />
      </div>
      <p className="mt-1 text-sm text-foreground/60">
        {t("placedOn", { date: new Date(order.createdAt).toLocaleDateString() })}
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 p-5">
        <h2 className="font-semibold text-foreground">{t("trackTitle")}</h2>
        <div className="mt-4">
          <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 p-5">
        <h2 className="font-semibold text-foreground">{tCheckout("orderSummary")}</h2>
        <div className="mt-3 divide-y divide-brand-100">
          {order.items.map((item: { sku: string; name: string; size: string; price: number; qty: number }) => (
            <div key={item.sku} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-foreground/60">
                  {item.size} × {item.qty}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-brand-100 pt-3 font-bold text-brand-800">
          <span>{tCart("total")}</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.address && (
        <div className="mt-6 rounded-xl border border-brand-100 p-5">
          <h2 className="font-semibold text-foreground">{t("deliveryAddress")}</h2>
          <p className="mt-2 text-sm text-foreground/70">
            {order.address.fullName}
            <br />
            {order.address.line}, {order.address.city}
            <br />
            {order.address.state} — {order.address.pincode}
            <br />
            {order.address.phone}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 p-5">
        <h2 className="font-semibold text-foreground">{t("paymentMethod")}</h2>
        <p className="mt-2 text-sm text-foreground/70">
          {tCheckout("paymentCod")} · {order.paymentStatus === "paid" ? "✓" : ""}
        </p>
      </div>
    </div>
  );
}
