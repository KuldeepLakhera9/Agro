"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Admin.Login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t("invalidPhone"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setOtpSent(true);
      setDevCode(data.devCode);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t("genericError"));
        return;
      }
      if (data.role !== "staff" && data.role !== "owner") {
        setError(t("notAuthorized"));
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-2 flex justify-end">
        <AdminLanguageSwitcher current={locale} />
      </div>
      <h1 className="text-xl font-bold text-brand-800">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>

      {!otpSent ? (
        <>
          <label className="mt-6 block text-sm font-medium text-foreground/80">
            {t("mobileNumber")}
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-foreground/60">+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              className="flex-1 rounded-lg border border-earth-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            onClick={sendOtp}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {t("sendOtp")}
          </button>
        </>
      ) : (
        <>
          {devCode && (
            <p className="mt-4 rounded-md bg-earth-100 px-3 py-2 text-sm font-medium text-earth-700">
              {t("devNotice", { code: devCode })}
            </p>
          )}
          <label className="mt-4 block text-sm font-medium text-foreground/80">
            {t("enterOtp")}
          </label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none"
          />
          <button
            onClick={verifyOtp}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {t("verifyAndLogin")}
          </button>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
