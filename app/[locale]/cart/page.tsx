"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>
        <p className="mt-4 text-foreground/60">{t("empty")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-6 divide-y divide-brand-100 rounded-2xl border border-brand-100">
        {items.map((item) => (
          <div key={item.sku} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
              {item.image && (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-foreground/60">{item.size}</p>
              <p className="text-sm font-semibold text-brand-700">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-brand-200">
              <button
                className="px-2.5 py-1 text-lg text-brand-700"
                onClick={() => updateQty(item.sku, item.qty - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
              <button
                className="px-2.5 py-1 text-lg text-brand-700"
                onClick={() => updateQty(item.sku, item.qty + 1)}
                disabled={item.qty >= item.maxStock}
              >
                +
              </button>
            </div>
            <p className="w-20 text-right text-sm font-semibold">
              {formatPrice(item.price * item.qty)}
            </p>
            <button
              onClick={() => removeItem(item.sku)}
              className="text-sm text-red-600 hover:underline"
            >
              {t("remove")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-50 px-5 py-4">
        <span className="font-medium text-foreground/80">{t("subtotal")}</span>
        <span className="text-xl font-bold text-brand-800">{formatPrice(subtotal)}</span>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          href="/shop"
          className="rounded-full border-2 border-brand-600 px-6 py-3 text-center font-semibold text-brand-700 hover:bg-brand-50"
        >
          {t("continueShopping")}
        </Link>
        <Link
          href="/checkout"
          className="rounded-full bg-brand-600 px-6 py-3 text-center font-semibold text-white hover:bg-brand-700"
        >
          {t("proceedToCheckout")}
        </Link>
      </div>
    </div>
  );
}
