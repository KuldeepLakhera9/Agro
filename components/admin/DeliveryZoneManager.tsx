"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Zone {
  _id: string;
  pincode: string;
  area: string;
}

export default function DeliveryZoneManager({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addZone() {
    setError(null);
    if (!/^\d{6}$/.test(pincode) || !area.trim()) {
      setError("Enter a valid 6-digit pincode and area name.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, area }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "duplicate_pincode" ? "This pincode is already added." : "Failed to add.");
        return;
      }
      setPincode("");
      setArea("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeZone(id: string) {
    await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-earth-200 bg-white p-4">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Pincode"
          className="w-32 rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area name (e.g. Karjat)"
          className="flex-1 rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
        <button
          onClick={addZone}
          disabled={busy}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          + Add
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 divide-y divide-earth-100 rounded-xl border border-earth-200 bg-white">
        {zones.map((z) => (
          <div key={z._id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              <span className="font-medium">{z.pincode}</span> — {z.area}
            </span>
            <button onClick={() => removeZone(z._id)} className="text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {zones.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">No delivery zones yet.</p>
        )}
      </div>
    </div>
  );
}
