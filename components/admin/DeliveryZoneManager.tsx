"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Zone {
  _id: string;
  pincode: string;
  area: string;
}

export default function DeliveryZoneManager({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const t = useTranslations("Admin.Settings");
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addZone() {
    setError(null);
    if (!/^\d{6}$/.test(pincode) || !area.trim()) {
      setError(t("invalidZoneError"));
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
        setError(data.error === "duplicate_pincode" ? t("duplicatePincodeError") : t("addZoneFailedError"));
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
          placeholder={t("pincodePlaceholder")}
          className="w-32 rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder={t("areaPlaceholder")}
          className="flex-1 rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
        <button
          onClick={addZone}
          disabled={busy}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {t("addZone")}
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
              {t("remove")}
            </button>
          </div>
        ))}
        {zones.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noZones")}</p>
        )}
      </div>
    </div>
  );
}
