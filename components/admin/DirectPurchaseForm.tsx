"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProductOption {
  _id: string;
  name: string;
}

export default function DirectPurchaseForm({
  farmerId,
  products,
}: {
  farmerId: string;
  products: ProductOption[];
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Farmers");
  const tProcurement = useTranslations("Admin.Procurement");
  const tCommon = useTranslations("Admin.Common");
  const [productId, setProductId] = useState(products[0]?._id ?? "");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"kg" | "quintal">("kg");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const qty = Number(quantity);
    const p = Number(price);
    if (!productId || !qty || qty <= 0 || !p || p <= 0) {
      setError(t("directPurchaseError"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/farmers/${farmerId}/direct-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty, unit, pricePerUnit: p }),
      });
      if (!res.ok) {
        setError(t("recordPurchaseFailedError"));
        return;
      }
      router.push(`/admin/farmers/${farmerId}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground/70">{tProcurement("product")}</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("quantity")}</label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{tProcurement("unit")}</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "kg" | "quintal")}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          >
            <option value="kg">kg</option>
            <option value="quintal">quintal</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70">
          {tProcurement("pricePerUnit", { unit })}
        </label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="₹"
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? tCommon("saving") : t("recordPurchaseButton")}
      </button>
      <p className="text-xs text-foreground/50">{t("directPurchaseNote")}</p>
    </div>
  );
}
