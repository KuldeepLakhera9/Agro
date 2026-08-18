"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { pick } from "@/lib/localizedField";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { type PlainProduct } from "@/lib/queries/products";
import TrustBadge from "@/components/TrustBadge";

export default function ProductDetail({
  product,
  locale,
}: {
  product: PlainProduct;
  locale: string;
}) {
  const t = useTranslations("Product");
  const shopT = useTranslations("Shop");
  const router = useRouter();
  const { addItem } = useCart();

  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantSku, setVariantSku] = useState(firstInStock?.sku);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "yes" | "no" | "invalid">("idle");

  const variant = product.variants.find((v) => v.sku === variantSku) ?? product.variants[0];
  const name = pick(product.name, locale);

  function handleAddToCart() {
    if (!variant) return;
    addItem(
      {
        productId: product._id,
        sku: variant.sku,
        slug: product.slug,
        name,
        image: product.images[0] ?? "",
        size: variant.size,
        price: variant.price,
        maxStock: variant.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  async function checkPincode() {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus("invalid");
      return;
    }
    setPincodeStatus("checking");
    try {
      const res = await fetch("/api/delivery-zones/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode }),
      });
      const data = await res.json();
      setPincodeStatus(data.deliverable ? "yes" : "no");
    } catch {
      setPincodeStatus("no");
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
        <Image
          src={product.images[0] ?? "/images/products/wheat-grain.svg"}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5">
          {product.badges.map((b) => (
            <TrustBadge key={b} badge={b} />
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">{name}</h1>

        {variant && (
          <p className="mt-2 text-2xl font-bold text-brand-700">
            {formatPrice(variant.price)}
            <span className="ml-2 text-sm font-normal text-foreground/60">
              / {variant.unitLabel}
            </span>
          </p>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-foreground/80">{t("selectSize")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.sku}
                disabled={v.stock === 0}
                onClick={() => setVariantSku(v.sku)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  v.sku === variantSku
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 text-brand-800 hover:bg-brand-50"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
          {variant && variant.stock === 0 && (
            <p className="mt-2 text-sm text-red-600">{t("outOfStockNotice")}</p>
          )}
          {variant && variant.stock > 0 && variant.stock <= 5 && (
            <p className="mt-2 text-sm text-earth-600">
              {shopT("lowStock", { count: variant.stock })}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm font-medium text-foreground/80">{t("quantity")}</p>
          <div className="flex items-center rounded-lg border border-brand-200">
            <button
              className="px-3 py-1.5 text-lg text-brand-700"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-medium">{qty}</span>
            <button
              className="px-3 py-1.5 text-lg text-brand-700"
              onClick={() => setQty((q) => Math.min(variant?.stock ?? 1, q + 1))}
              disabled={!variant || qty >= variant.stock}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!variant || variant.stock === 0}
            className="flex-1 rounded-full border-2 border-brand-600 px-6 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? t("addedToCart") : t("addToCart")}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!variant || variant.stock === 0}
            className="flex-1 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("buyNow")}
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-brand-100 p-4">
          <p className="text-sm font-medium text-foreground/80">{t("checkDelivery")}</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                setPincodeStatus("idle");
              }}
              placeholder={t("pincodePlaceholder")}
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              onClick={checkPincode}
              className="rounded-lg bg-earth-600 px-4 py-2 text-sm font-semibold text-white hover:bg-earth-700"
            >
              {t("checkButton")}
            </button>
          </div>
          {pincodeStatus === "yes" && (
            <p className="mt-2 text-sm font-medium text-brand-700">{t("deliverable")}</p>
          )}
          {pincodeStatus === "no" && (
            <p className="mt-2 text-sm font-medium text-red-600">{t("notDeliverable")}</p>
          )}
          {pincodeStatus === "invalid" && (
            <p className="mt-2 text-sm font-medium text-red-600">{t("invalidPincode")}</p>
          )}
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold text-foreground/80">{t("descriptionTitle")}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {pick(product.description, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
