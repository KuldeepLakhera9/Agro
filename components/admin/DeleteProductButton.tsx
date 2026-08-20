"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const t = useTranslations("Admin.Catalog");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      router.push("/admin/products");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="rounded-full border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {confirming ? t("deleteConfirm") : t("deleteProduct")}
    </button>
  );
}
