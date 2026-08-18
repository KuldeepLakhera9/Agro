"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/orderStatuses";

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentDriver,
}: {
  orderId: string;
  currentStatus: string;
  currentDriver?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [driverName, setDriverName] = useState(currentDriver ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, driverName: driverName || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-earth-200 bg-white p-5">
      <h2 className="font-semibold text-foreground">Update Order</h2>

      <label className="mt-4 block text-sm font-medium text-foreground/70">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm font-medium text-foreground/70">
        Driver / Delivery Person (optional)
      </label>
      <input
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        placeholder="e.g. Amol"
        className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleUpdate}
        disabled={busy}
        className="mt-4 w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Updating…" : "Update Order"}
      </button>
    </div>
  );
}
