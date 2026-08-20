"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface AdminUser {
  _id: string;
  phone: string;
  role: string;
}

export default function UserRoleManager({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const t = useTranslations("Admin.Settings");
  const tFarmers = useTranslations("Admin.Farmers");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addStaff() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t("invalidPhoneError"));
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role: "staff" }),
      });
      setPhone("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userPhone: string) {
    const tenDigit = userPhone.replace("+91", "");
    setBusy(true);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: tenDigit, role: "customer" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-earth-200 bg-white p-4">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder={tFarmers("phonePlaceholder")}
          className="flex-1 rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
        <button
          onClick={addStaff}
          disabled={busy}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {t("grantStaff")}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 divide-y divide-earth-100 rounded-xl border border-earth-200 bg-white">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              {u.phone} —{" "}
              <span className={u.role === "owner" ? "font-semibold text-brand-700" : ""}>
                {t((u.role === "owner" ? "roleOwner" : "roleStaff") as never)}
              </span>
            </span>
            {u.role === "staff" && (
              <button onClick={() => revoke(u.phone)} className="text-red-600 hover:underline">
                {t("revoke")}
              </button>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noAdminUsers")}</p>
        )}
      </div>
    </div>
  );
}
