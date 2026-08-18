"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { formatPrice } from "@/lib/format";

type Step = "login" | "address" | "delivery" | "payment" | "review";

interface Address {
  fullName: string;
  line: string;
  city: string;
  pincode: string;
  state: string;
  phone: string;
}

export default function CheckoutFlow() {
  const t = useTranslations("Checkout");
  const errorsT = useTranslations("Errors");
  const cartT = useTranslations("Cart");
  const locale = useLocale() as "mr" | "hi" | "en";
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const orderRef = useMemo(() => crypto.randomUUID(), []);

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [step, setStep] = useState<Step>("login");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<"home_delivery" | "store_pickup">(
    "home_delivery",
  );
  const [address, setAddress] = useState<Address>({
    fullName: "",
    line: "",
    city: "",
    pincode: "",
    state: "Maharashtra",
    phone: "",
  });
  const [addressError, setAddressError] = useState<string | null>(null);
  const [checkingZone, setCheckingZone] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setLoggedIn(Boolean(data.session));
        setStep(data.session ? "delivery" : "login");
        setAuthChecked(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendOtp() {
    setAuthError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setAuthError("invalidPhone");
      return;
    }
    setAuthBusy(true);
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
      setAuthBusy(false);
    }
  }

  async function verifyOtp() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAuthError(data.error ?? "generic");
        return;
      }
      setLoggedIn(true);
      setStep("delivery");
    } finally {
      setAuthBusy(false);
    }
  }

  async function confirmAddress() {
    setAddressError(null);
    if (!address.fullName || !address.line || !address.city || !/^\d{6}$/.test(address.pincode) || !address.phone) {
      setAddressError("invalidPincode");
      return;
    }
    setCheckingZone(true);
    try {
      const res = await fetch("/api/delivery-zones/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: address.pincode }),
      });
      const data = await res.json();
      if (!data.deliverable) {
        setAddressError("deliveryOutOfZone");
        return;
      }
      setStep("payment");
    } finally {
      setCheckingZone(false);
    }
  }

  async function placeOrder() {
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef,
          items: items.map((i) => ({ sku: i.sku, qty: i.qty })),
          deliveryMethod,
          address: deliveryMethod === "home_delivery" ? address : undefined,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlaceError(data.error ?? "generic");
        return;
      }
      clear();
      router.push(`/orders/${data.order._id}?new=1`);
    } finally {
      setPlacing(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "login", label: t("stepLogin") },
    ...(deliveryMethod === "home_delivery"
      ? [{ key: "address" as Step, label: t("stepAddress") }]
      : []),
    { key: "delivery", label: t("stepDelivery") },
    { key: "payment", label: t("stepPayment") },
    { key: "review", label: t("stepReview") },
  ];

  if (!authChecked) {
    return <div className="px-4 py-20 text-center text-foreground/50">…</div>;
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {steps.map((s) => (
            <span
              key={s.key}
              className={`rounded-full px-3 py-1 font-medium ${
                step === s.key
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-brand-500"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {step === "login" && !loggedIn && (
          <div className="mt-8 max-w-sm">
            <p className="text-sm text-foreground/70">{t("loginPrompt")}</p>
            {!otpSent ? (
              <>
                <label className="mt-4 block text-sm font-medium text-foreground/80">
                  {t("phoneLabel")}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-foreground/60">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder={t("phonePlaceholder")}
                    inputMode="numeric"
                    className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  disabled={authBusy}
                  className="mt-4 w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {t("sendOtp")}
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-foreground/70">
                  {t("otpSentTo", { phone })}
                </p>
                {devCode && (
                  <p className="mt-1 rounded-md bg-earth-50 px-3 py-2 text-sm font-medium text-earth-700">
                    {t("otpDevNotice", { code: devCode })}
                  </p>
                )}
                <label className="mt-4 block text-sm font-medium text-foreground/80">
                  {t("otpLabel")}
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none"
                />
                <button
                  onClick={verifyOtp}
                  disabled={authBusy}
                  className="mt-4 w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {t("verifyOtp")}
                </button>
                <button
                  onClick={sendOtp}
                  disabled={authBusy}
                  className="mt-2 w-full text-sm text-brand-600 hover:underline"
                >
                  {t("resendOtp")}
                </button>
              </>
            )}
            {authError && (
              <p className="mt-3 text-sm text-red-600">{errorsT(authError as never)}</p>
            )}
          </div>
        )}

        {step === "delivery" && (
          <div className="mt-8 max-w-sm space-y-3">
            <p className="text-sm font-medium text-foreground/80">
              {t("deliveryMethodTitle")}
            </p>
            {(["home_delivery", "store_pickup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDeliveryMethod(m)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  deliveryMethod === m
                    ? "border-brand-600 bg-brand-50"
                    : "border-brand-100 hover:bg-brand-50/50"
                }`}
              >
                <p className="font-semibold text-foreground">
                  {m === "home_delivery" ? t("homeDelivery") : t("storePickup")}
                </p>
                <p className="text-sm text-foreground/60">
                  {m === "home_delivery" ? t("homeDeliveryDesc") : t("storePickupDesc")}
                </p>
              </button>
            ))}
            <button
              onClick={() => setStep(deliveryMethod === "home_delivery" ? "address" : "payment")}
              className="w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              {t("stepReview")} →
            </button>
          </div>
        )}

        {step === "address" && (
          <div className="mt-8 max-w-sm space-y-3">
            <input
              placeholder={t("addressFullName")}
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <input
              placeholder={t("addressLine")}
              value={address.line}
              onChange={(e) => setAddress({ ...address, line: e.target.value })}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <input
                placeholder={t("addressCity")}
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <input
                placeholder={t("addressPincode")}
                value={address.pincode}
                inputMode="numeric"
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
                className="w-28 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <input
              placeholder={t("addressState")}
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <input
              placeholder={t("addressPhone")}
              value={address.phone}
              inputMode="numeric"
              onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {addressError && (
              <p className="text-sm text-red-600">
                {t(addressError as never)}
              </p>
            )}
            <button
              onClick={confirmAddress}
              disabled={checkingZone}
              className="w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {t("saveAddress")}
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="mt-8 max-w-sm space-y-3">
            <p className="text-sm font-medium text-foreground/80">{t("paymentMethodTitle")}</p>
            <div className="rounded-xl border-2 border-brand-600 bg-brand-50 p-4">
              <p className="font-semibold text-foreground">{t("paymentCod")}</p>
              <p className="text-sm text-foreground/60">{t("paymentCodDesc")}</p>
            </div>
            <div className="rounded-xl border border-brand-100 p-4 opacity-50">
              <p className="font-semibold text-foreground/60">{t("paymentOnlineComingSoon")}</p>
            </div>
            <button
              onClick={() => setStep("review")}
              className="w-full rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              {t("stepReview")} →
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="mt-8 max-w-sm space-y-4">
            {deliveryMethod === "home_delivery" && (
              <div className="rounded-xl border border-brand-100 p-4 text-sm">
                <p className="font-semibold text-foreground">{t("stepAddress")}</p>
                <p className="mt-1 text-foreground/70">
                  {address.fullName}, {address.line}, {address.city} — {address.pincode}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-brand-100 p-4 text-sm">
              <p className="font-semibold text-foreground">{t("stepDelivery")}</p>
              <p className="mt-1 text-foreground/70">
                {deliveryMethod === "home_delivery" ? t("homeDelivery") : t("storePickup")}
              </p>
            </div>
            <div className="rounded-xl border border-brand-100 p-4 text-sm">
              <p className="font-semibold text-foreground">{t("stepPayment")}</p>
              <p className="mt-1 text-foreground/70">{t("paymentCod")}</p>
            </div>
            {placeError && (
              <p className="text-sm text-red-600">
                {placeError === "delivery_out_of_zone"
                  ? t("deliveryOutOfZone")
                  : placeError === "out_of_stock"
                    ? errorsT("outOfStock")
                    : t("orderFailed")}
              </p>
            )}
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {placing ? t("placingOrder") : t("placeOrder")}
            </button>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-brand-100 p-5">
        <h2 className="font-semibold text-foreground">{t("orderSummary")}</h2>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.sku} className="flex justify-between text-sm">
              <span className="text-foreground/70">
                {item.name} ({item.size}) × {item.qty}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-brand-100 pt-3 font-bold text-brand-800">
          <span>{cartT("subtotal")}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <Link href="/cart" className="mt-3 block text-center text-sm text-brand-600 hover:underline">
          {cartT("title")}
        </Link>
      </aside>
    </div>
  );
}
