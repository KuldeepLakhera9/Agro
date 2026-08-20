"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface RequestInfo {
  id: string;
  productName: string;
  quantityNeeded: number;
  unit: string;
  targetPricePerUnit?: number;
  neededBy?: string;
}

type Step = "loading" | "invalid" | "login" | "form" | "done";

export default function OfferFlow() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [step, setStep] = useState<Step>(() => (requestId ? "loading" : "invalid"));
  const [requestInfo, setRequestInfo] = useState<RequestInfo | null>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [readyBy, setReadyBy] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      const [reqRes, meRes] = await Promise.all([
        fetch(`/api/farmer/purchase-requests/${requestId}`),
        fetch("/api/farmer/me"),
      ]);
      if (!reqRes.ok) {
        setStep("invalid");
        return;
      }
      const reqData = await reqRes.json();
      setRequestInfo(reqData.request);
      const meData = await meRes.json();
      setStep(meData.session ? "form" : "login");
    })();
  }, [requestId]);

  async function sendOtp() {
    setAuthError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setAuthError("कृपया वैध १० अंकी मोबाईल नंबर टाका");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/farmer/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAuthError(
          data.error === "not_registered"
            ? "हा नंबर आमच्याकडे नोंदणीकृत नाही. कृपया कार्यालयाशी संपर्क साधा."
            : "काहीतरी चूक झाली. पुन्हा प्रयत्न करा.",
        );
        return;
      }
      const data = await res.json();
      setOtpSent(true);
      setDevCode(data.devCode);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setAuthError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/farmer/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      if (!res.ok) {
        setAuthError("चुकीचा OTP. कृपया पुन्हा प्रयत्न करा.");
        return;
      }
      setStep("form");
    } finally {
      setBusy(false);
    }
  }

  async function submitOffer() {
    setFormError(null);
    const qty = Number(quantity);
    const p = Number(price);
    if (!qty || qty <= 0 || !p || p <= 0) {
      setFormError("कृपया योग्य प्रमाण आणि दर टाका");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/farmer/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseRequestId: requestId,
          quantityAvailable: qty,
          pricePerUnit: p,
          readyByDate: readyBy || undefined,
        }),
      });
      if (!res.ok) {
        setFormError("माहिती पाठवताना अडचण आली. पुन्हा प्रयत्न करा.");
        return;
      }
      setStep("done");
    } finally {
      setBusy(false);
    }
  }

  if (step === "loading") {
    return <p className="p-6 text-center text-brand-800">लोड होत आहे...</p>;
  }

  if (step === "invalid") {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-bold text-brand-900">ही लिंक सापडली नाही</p>
        <p className="mt-2 text-sm text-brand-700">
          कृपया कार्यालयाशी संपर्क साधा किंवा नवीन लिंकसाठी विचारा.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-brand-900">आईसाहेब ऍग्रो इंडस्ट्रीज</p>
        <p className="text-sm text-brand-700">माल खरेदी विनंती</p>

        {requestInfo && (
          <div className="mt-4 rounded-xl bg-brand-50 p-4">
            <p className="font-semibold text-brand-900">{requestInfo.productName}</p>
            <p className="mt-1 text-sm text-brand-800">
              आवश्यक प्रमाण: {requestInfo.quantityNeeded} {requestInfo.unit}
            </p>
            {requestInfo.targetPricePerUnit && (
              <p className="text-sm text-brand-800">
                अंदाजे दर: ₹{requestInfo.targetPricePerUnit}/{requestInfo.unit}
              </p>
            )}
            {requestInfo.neededBy && (
              <p className="text-sm text-brand-800">
                आवश्यक तारीख: {new Date(requestInfo.neededBy).toLocaleDateString("mr-IN")}
              </p>
            )}
          </div>
        )}
      </div>

      {step === "login" && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          {!otpSent ? (
            <>
              <label className="block text-base font-semibold text-brand-900">
                तुमचा मोबाईल नंबर टाका
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                placeholder="१० अंकी मोबाईल नंबर"
                className="mt-3 w-full rounded-xl border-2 border-brand-200 px-4 py-4 text-lg focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={sendOtp}
                disabled={busy}
                className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                OTP पाठवा
              </button>
            </>
          ) : (
            <>
              {devCode && (
                <p className="mb-3 rounded-lg bg-earth-100 px-3 py-2 text-sm font-medium text-earth-700">
                  डेव्हलपमेंट मोड — OTP: {devCode}
                </p>
              )}
              <label className="block text-base font-semibold text-brand-900">OTP टाका</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                className="mt-3 w-full rounded-xl border-2 border-brand-200 px-4 py-4 text-center text-2xl tracking-widest focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={verifyOtp}
                disabled={busy}
                className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                पडताळणी करा
              </button>
            </>
          )}
          {authError && <p className="mt-3 text-sm font-medium text-red-600">{authError}</p>}
        </div>
      )}

      {step === "form" && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <label className="block text-base font-semibold text-brand-900">
            तुमच्याकडे किती प्रमाण उपलब्ध आहे?
          </label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder={requestInfo?.unit ?? "प्रमाण"}
            className="mt-2 w-full rounded-xl border-2 border-brand-200 px-4 py-4 text-lg focus:border-brand-500 focus:outline-none"
          />

          <label className="mt-5 block text-base font-semibold text-brand-900">
            तुमचा दर (प्रति {requestInfo?.unit ?? "एकक"})
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="₹"
            className="mt-2 w-full rounded-xl border-2 border-brand-200 px-4 py-4 text-lg focus:border-brand-500 focus:outline-none"
          />

          <label className="mt-5 block text-base font-semibold text-brand-900">
            माल आणण्याची तारीख (ऐच्छिक)
          </label>
          <input
            type="date"
            value={readyBy}
            onChange={(e) => setReadyBy(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-brand-200 px-4 py-4 text-lg focus:border-brand-500 focus:outline-none"
          />

          {formError && <p className="mt-3 text-sm font-medium text-red-600">{formError}</p>}

          <button
            onClick={submitOffer}
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            माहिती पाठवा
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-2xl">✅</p>
          <p className="mt-2 text-lg font-bold text-brand-900">धन्यवाद!</p>
          <p className="mt-1 text-sm text-brand-700">
            तुमची माहिती आम्हाला मिळाली आहे. आम्ही लवकरच तुमच्याशी संपर्क साधू.
          </p>
        </div>
      )}
    </div>
  );
}
