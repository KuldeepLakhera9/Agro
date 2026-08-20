"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProductOption {
  _id: string;
  name: string;
}

interface FarmerOption {
  _id: string;
  name: string;
  village?: string;
  rating?: number | null;
}

export default function PurchaseRequestForm({
  products,
  initialProductId,
}: {
  products: ProductOption[];
  initialProductId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Procurement");
  const tCommon = useTranslations("Admin.Common");
  const tErrors = useTranslations("Errors");
  const [productId, setProductId] = useState(initialProductId ?? products[0]?._id ?? "");
  const [quantityNeeded, setQuantityNeeded] = useState("");
  const [unit, setUnit] = useState<"kg" | "quintal">("kg");
  const [targetPrice, setTargetPrice] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [farmers, setFarmers] = useState<FarmerOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/farmers?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setFarmers(data.farmers ?? []);
        setSelected((data.farmers ?? []).map((f: FarmerOption) => f._id));
      });
  }, [productId]);

  function toggleFarmer(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSubmit() {
    setError(null);
    const qty = Number(quantityNeeded);
    if (!productId || !qty || qty <= 0) {
      setError(t("invalidRequestError"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantityNeeded: qty,
          unit,
          targetPricePerUnit: targetPrice ? Number(targetPrice) : undefined,
          neededBy: neededBy || undefined,
          farmerIds: selected,
        }),
      });
      if (!res.ok) {
        setError(tErrors("generic"));
        return;
      }
      const data = await res.json();
      router.push(`/admin/procurement/purchase-requests/${data.request._id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground/70">{t("product")}</label>
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
          <label className="block text-sm font-medium text-foreground/70">{t("quantityNeeded")}</label>
          <input
            value={quantityNeeded}
            onChange={(e) => setQuantityNeeded(e.target.value.replace(/[^\d.]/g, ""))}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("unit")}</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70">
            {t("targetPrice", { unit })}
          </label>
          <input
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="₹"
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("neededBy")}</label>
          <input
            type="date"
            value={neededBy}
            onChange={(e) => setNeededBy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">
          {t("notifyFarmers", { count: selected.length })}
        </p>
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-earth-200 p-2">
          {farmers.map((f) => (
            <label key={f._id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-earth-50">
              <input
                type="checkbox"
                checked={selected.includes(f._id)}
                onChange={() => toggleFarmer(f._id)}
              />
              <span>{f.name}</span>
              <span className="text-foreground/50">
                {f.village ? `· ${f.village}` : ""} {f.rating ? `· ★${f.rating.toFixed(1)}` : ""}
              </span>
            </label>
          ))}
          {farmers.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-foreground/50">
              {t("noFarmersForProduct")}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? tCommon("saving") : t("saveAsDraft")}
      </button>
      <p className="text-xs text-foreground/50">{t("draftNote")}</p>
    </div>
  );
}
