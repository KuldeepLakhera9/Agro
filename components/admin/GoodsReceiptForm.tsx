"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function GoodsReceiptForm({
  offerId,
  farmerName,
  productName,
  unit,
  defaultQuantity,
  defaultPrice,
}: {
  offerId: string;
  farmerName: string;
  productName: string;
  unit: string;
  defaultQuantity: number;
  defaultPrice: number;
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Procurement");
  const tCommon = useTranslations("Admin.Common");
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [price, setPrice] = useState(String(defaultPrice));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const qty = Number(quantity);
    const p = Number(price);
    if (!qty || qty <= 0 || !p || p <= 0) {
      setError(t("invalidQuantityPriceError"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/goods-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerOfferId: offerId, quantityReceived: qty, pricePerUnit: p }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(
          data.error === "offer_not_accepted"
            ? t("offerNotAcceptedError")
            : t("receiptFailedError"),
        );
        return;
      }
      router.push("/admin/procurement/purchase-requests");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="rounded-xl border border-earth-200 bg-white p-4 text-sm">
        <p className="font-medium text-foreground">{farmerName}</p>
        <p className="text-foreground/60">{productName}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70">
          {t("quantityReceived", { unit })}
        </label>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70">
          {t("pricePerUnit", { unit })}
        </label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? tCommon("saving") : t("recordAndUpdateStock")}
      </button>
    </div>
  );
}
