"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function MarkPaymentButton({
  receiptId,
  outstanding,
}: {
  receiptId: string;
  outstanding: number;
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Farmers");
  const tCommon = useTranslations("Admin.Common");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(outstanding));
  const [mode, setMode] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await fetch(`/api/admin/goods-receipts/${receiptId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: Number(amount), paymentMode: mode }),
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
        className="rounded-full border border-brand-300 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
      >
        {t("markPayment")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-20 rounded border border-earth-200 px-2 py-1 text-xs"
      />
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as typeof mode)}
        className="rounded border border-earth-200 px-2 py-1 text-xs"
      >
        <option value="cash">{t("paymentCash")}</option>
        <option value="upi">{t("paymentUpi")}</option>
        <option value="bank_transfer">{t("paymentBank")}</option>
      </select>
      <button
        onClick={submit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
      >
        {tCommon("confirm")}
      </button>
    </div>
  );
}
