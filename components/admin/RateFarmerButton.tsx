"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RateFarmerButton({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const t = useTranslations("Admin.Farmers");
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(5);
  const [onTime, setOnTime] = useState(true);
  const [qualityMatch, setQualityMatch] = useState(true);
  const [honestQuantity, setHonestQuantity] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await fetch(`/api/admin/goods-receipts/${receiptId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, onTime, qualityMatch, honestQuantity }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-earth-300 px-3 py-1 text-xs font-semibold text-earth-700 hover:bg-earth-50"
      >
        {t("rateDelivery")}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-earth-200 bg-earth-50 p-3 text-xs">
      <div className="flex items-center gap-2">
        <span>{t("score")}</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setScore(s)}
            className={s <= score ? "text-amber-500" : "text-earth-300"}
          >
            ★
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={onTime} onChange={(e) => setOnTime(e.target.checked)} />
          {t("onTime")}
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={qualityMatch}
            onChange={(e) => setQualityMatch(e.target.checked)}
          />
          {t("qualityMatched")}
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={honestQuantity}
            onChange={(e) => setHonestQuantity(e.target.checked)}
          />
          {t("honestQuantity")}
        </label>
      </div>
      <button
        onClick={submit}
        disabled={busy}
        className="mt-2 rounded-full bg-brand-600 px-3 py-1 font-semibold text-white hover:bg-brand-700"
      >
        {t("submitRating")}
      </button>
    </div>
  );
}
