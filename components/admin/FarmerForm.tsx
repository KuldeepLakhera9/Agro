"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProductOption {
  _id: string;
  name: string;
}

interface FarmerFormValue {
  name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  suppliedProducts: { productId: string; productName: string }[];
  preferredPaymentMode: "cash" | "upi" | "bank_transfer";
  upiId: string;
  bankDetails: { accountNumber: string; ifsc: string; accountHolder: string };
  isVerified: boolean;
  isActive: boolean;
  notes: string;
}

const EMPTY: FarmerFormValue = {
  name: "",
  phone: "",
  village: "",
  taluka: "",
  district: "",
  suppliedProducts: [],
  preferredPaymentMode: "cash",
  upiId: "",
  bankDetails: { accountNumber: "", ifsc: "", accountHolder: "" },
  isVerified: false,
  isActive: true,
  notes: "",
};

export default function FarmerForm({
  farmerId,
  initial,
  products,
}: {
  farmerId?: string;
  initial?: Partial<FarmerFormValue>;
  products: ProductOption[];
}) {
  const router = useRouter();
  const t = useTranslations("Admin.Farmers");
  const tCommon = useTranslations("Admin.Common");
  const tErrors = useTranslations("Errors");
  const [value, setValue] = useState<FarmerFormValue>({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleProduct(p: ProductOption) {
    setValue((v) => {
      const exists = v.suppliedProducts.some((sp) => sp.productId === p._id);
      return {
        ...v,
        suppliedProducts: exists
          ? v.suppliedProducts.filter((sp) => sp.productId !== p._id)
          : [...v.suppliedProducts, { productId: p._id, productName: p.name }],
      };
    });
  }

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(farmerId ? `/api/admin/farmers/${farmerId}` : "/api/admin/farmers", {
        method: farmerId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "duplicate_phone" ? t("duplicatePhoneError") : tErrors("generic"));
        return;
      }
      router.push("/admin/farmers");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("name")}</label>
          <input
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{tCommon("phone")}</label>
          <input
            value={value.phone}
            onChange={(e) => setValue({ ...value, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder={t("phonePlaceholder")}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("village")}</label>
          <input
            value={value.village}
            onChange={(e) => setValue({ ...value, village: e.target.value })}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("taluka")}</label>
          <input
            value={value.taluka}
            onChange={(e) => setValue({ ...value, taluka: e.target.value })}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("district")}</label>
          <input
            value={value.district}
            onChange={(e) => setValue({ ...value, district: e.target.value })}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">{t("productsSupplied")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.map((p) => (
            <label
              key={p._id}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                value.suppliedProducts.some((sp) => sp.productId === p._id)
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-earth-200 text-foreground/70"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={value.suppliedProducts.some((sp) => sp.productId === p._id)}
                onChange={() => toggleProduct(p)}
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground/70">{t("preferredPayment")}</label>
          <select
            value={value.preferredPaymentMode}
            onChange={(e) =>
              setValue({ ...value, preferredPaymentMode: e.target.value as FarmerFormValue["preferredPaymentMode"] })
            }
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          >
            <option value="cash">{t("paymentCash")}</option>
            <option value="upi">{t("paymentUpi")}</option>
            <option value="bank_transfer">{t("paymentBank")}</option>
          </select>
        </div>
        {value.preferredPaymentMode === "upi" && (
          <div>
            <label className="block text-sm font-medium text-foreground/70">{t("upiId")}</label>
            <input
              value={value.upiId}
              onChange={(e) => setValue({ ...value, upiId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      {value.preferredPaymentMode === "bank_transfer" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            value={value.bankDetails.accountHolder}
            onChange={(e) =>
              setValue({ ...value, bankDetails: { ...value.bankDetails, accountHolder: e.target.value } })
            }
            placeholder={t("accountHolder")}
            className="rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
          <input
            value={value.bankDetails.accountNumber}
            onChange={(e) =>
              setValue({ ...value, bankDetails: { ...value.bankDetails, accountNumber: e.target.value } })
            }
            placeholder={t("accountNumber")}
            className="rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
          <input
            value={value.bankDetails.ifsc}
            onChange={(e) => setValue({ ...value, bankDetails: { ...value.bankDetails, ifsc: e.target.value } })}
            placeholder={t("ifsc")}
            className="rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground/70">{t("notes")}</label>
        <textarea
          value={value.notes}
          onChange={(e) => setValue({ ...value, notes: e.target.value })}
          rows={2}
          placeholder={t("notesPlaceholder")}
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
          <input
            type="checkbox"
            checked={value.isVerified}
            onChange={(e) => setValue({ ...value, isVerified: e.target.checked })}
          />
          {t("verified")}
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
          <input
            type="checkbox"
            checked={value.isActive}
            onChange={(e) => setValue({ ...value, isActive: e.target.checked })}
          />
          {t("active")}
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? tCommon("saving") : t("saveFarmer")}
      </button>
    </div>
  );
}
