"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

interface Farmer {
  _id: string;
  name: string;
  village?: string;
  rating?: number | null;
}

interface Offer {
  _id: string;
  farmerId: string;
  farmer?: Farmer;
  quantityAvailable: number;
  pricePerUnit: number;
  readyByDate?: string;
  status: string;
}

export default function PurchaseRequestActions({
  requestId,
  status,
  unit,
  sentToFarmers,
  offers,
}: {
  requestId: string;
  status: string;
  unit: string;
  sentToFarmers: Farmer[];
  offers: Offer[];
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Procurement");
  const tCommon = useTranslations("Admin.Common");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const respondedFarmerIds = new Set(offers.map((o) => o.farmerId));

  async function sendRequest() {
    setBusyKey("send");
    try {
      await fetch(`/api/admin/purchase-requests/${requestId}/send`, { method: "POST" });
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  async function remind(farmerId: string) {
    setBusyKey(`remind-${farmerId}`);
    try {
      await fetch(`/api/admin/purchase-requests/${requestId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId }),
      });
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  async function acceptOffer(offerId: string) {
    setBusyKey(`accept-${offerId}`);
    try {
      await fetch(`/api/admin/farmer-offers/${offerId}/accept`, { method: "POST" });
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  async function rejectOffer(offerId: string) {
    setBusyKey(`reject-${offerId}`);
    try {
      await fetch(`/api/admin/farmer-offers/${offerId}/reject`, { method: "POST" });
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {status === "draft" && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm text-brand-800">{t("draftNotice")}</p>
          <button
            onClick={sendRequest}
            disabled={busyKey === "send"}
            className="mt-3 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busyKey === "send" ? t("sending") : t("sendToFarmers")}
          </button>
        </div>
      )}

      {status !== "draft" && (
        <div className="rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("sentToCount", { count: sentToFarmers.length })}</h2>
          <div className="mt-3 divide-y divide-earth-100">
            {sentToFarmers.map((f) => (
              <div key={f._id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {f.name} {f.village ? `· ${f.village}` : ""}
                </span>
                {respondedFarmerIds.has(f._id) ? (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {t("responded")}
                  </span>
                ) : (
                  <button
                    onClick={() => remind(f._id)}
                    disabled={busyKey === `remind-${f._id}`}
                    className="rounded-full border border-earth-300 px-3 py-1 text-xs font-medium text-earth-700 hover:bg-earth-50 disabled:opacity-50"
                  >
                    {busyKey === `remind-${f._id}` ? t("sending") : t("sendReminder")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-earth-200 bg-white p-5">
        <h2 className="font-semibold text-foreground">{t("offersCount", { count: offers.length })}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-earth-200 text-left text-foreground/50">
              <tr>
                <th className="py-2 pr-3">{t("colFarmer")}</th>
                <th className="py-2 pr-3">{t("colQty")}</th>
                <th className="py-2 pr-3">{t("colPrice")}</th>
                <th className="py-2 pr-3">{t("colReadyBy")}</th>
                <th className="py-2 pr-3">{t("colRating")}</th>
                <th className="py-2 pr-3">{tCommon("status")}</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {offers.map((o) => (
                <tr key={o._id}>
                  <td className="py-2 pr-3">{o.farmer?.name ?? "—"}</td>
                  <td className="py-2 pr-3">{o.quantityAvailable} {unit}</td>
                  <td className="py-2 pr-3">{formatPrice(o.pricePerUnit)}</td>
                  <td className="py-2 pr-3">
                    {o.readyByDate ? new Date(o.readyByDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2 pr-3">{o.farmer?.rating ? `★${o.farmer.rating.toFixed(1)}` : "—"}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.status === "accepted"
                          ? "bg-brand-50 text-brand-700"
                          : o.status === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-earth-100 text-earth-600"
                      }`}
                    >
                      {t(`offerStatus_${o.status}` as never)}
                    </span>
                  </td>
                  <td className="py-2">
                    {o.status === "submitted" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptOffer(o._id)}
                          disabled={busyKey === `accept-${o._id}`}
                          className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                          {tCommon("accept")}
                        </button>
                        <button
                          onClick={() => rejectOffer(o._id)}
                          disabled={busyKey === `reject-${o._id}`}
                          className="rounded-full border border-earth-300 px-3 py-1 text-xs font-medium text-earth-700 hover:bg-earth-50 disabled:opacity-50"
                        >
                          {tCommon("reject")}
                        </button>
                      </div>
                    )}
                    {o.status === "accepted" && (
                      <Link
                        href={`/admin/procurement/goods-receipts/new?offerId=${o._id}`}
                        className="rounded-full border border-brand-300 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        {t("recordReceipt")}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {offers.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground/50">{t("noOffers")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
