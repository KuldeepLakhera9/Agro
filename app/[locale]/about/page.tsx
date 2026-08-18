import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE, telLink, whatsappLink } from "@/lib/constants";

export default async function AboutPage() {
  const t = await getTranslations("About");
  const common = await getTranslations("Common");

  const values = [t("value1"), t("value2"), t("value3"), t("value4")];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
          ॥ श्री दत्त प्रसन्न ॥ शाखा नं. १ (रशीन)
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-950 sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-base text-brand-700 font-semibold">
          आईसाहेब ॲग्रो इंडस्ट्रीज — शेतकरी ते ग्राहक थेट सेवा
        </p>
      </div>

      {/* Traditional Ghani Photo Showcase */}
      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-brand-200/80 bg-white shadow-lg">
        <div className="relative aspect-16/10 w-full sm:aspect-16/9">
          <Image
            src="/images/story/ghani-process.jpg"
            alt="पारंपरिक लाकडी घाणा तेल प्रक्रिया - आईसाहेब ॲग्रो"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>
        <div className="bg-brand-50/70 p-4 text-xs font-medium text-brand-800 border-t border-brand-100 flex flex-wrap items-center justify-between gap-2">
          <span>🌿 अस्सल लाकडी घाण्यावर काढलेले १००% शुद्ध खाद्यतेल</span>
          <span>📍 रशीन, ता. कर्जत, जि. अहिल्यानगर</span>
        </div>
      </div>

      <div className="mt-10 space-y-6 text-foreground/80 leading-relaxed sm:text-lg">
        <p>{t("body1")}</p>
        <p>{t("body2")}</p>
      </div>

      {/* 3 Pillars Box */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-xs">
          <span className="text-2xl">🌱</span>
          <h3 className="mt-2 font-bold text-brand-900">१००% नैसर्गिक शेती</h3>
          <p className="mt-1 text-xs text-foreground/70">
            शेंगदाणा, सूर्यफूल, करडई व धान्याची शुद्धता शेतापासून थेट जपली जाते.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-xs">
          <span className="text-2xl">🛢️</span>
          <h3 className="mt-2 font-bold text-brand-900">पारंपरिक लाकडी घाणा</h3>
          <p className="mt-1 text-xs text-foreground/70">
            कमी तापमानात तेल काढल्याने नैसर्गिक पोषण, चव आणि सुगंध पूर्ण सुरक्षित राहतो.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-xs">
          <span className="text-2xl">⚙️</span>
          <h3 className="mt-2 font-bold text-brand-900">मशिन क्लिनिंग व ग्रेडिंग</h3>
          <p className="mt-1 text-xs text-foreground/70">
            खडे व भेसळ काढून ग्रेड-१ प्रतीचे स्वच्छ गहू, ज्वारी, बाजरी पॅक केले जाते.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-brand-50/80 border border-brand-200/70 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">{t("valuesTitle")}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v} className="flex items-center gap-2.5 rounded-xl bg-white p-3.5 border border-brand-100 font-medium text-brand-900 shadow-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                ✓
              </span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Direct Contact Box */}
      <div className="mt-10 rounded-2xl bg-brand-900 p-6 text-center text-white">
        <h3 className="text-lg font-bold">थेट शेतकऱ्यांशी संपर्क साधा</h3>
        <p className="mt-1 text-xs text-brand-200">{SITE.ownerName} — {SITE.addressLine}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={telLink(SITE.ownerPhone)}
            className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-brand-900 hover:bg-brand-50 shadow-sm"
          >
            📞 {common("callNow")} — {SITE.ownerPhoneDisplay}
          </a>
          <a
            href={whatsappLink(SITE.ownerPhone)}
            className="rounded-full border border-white px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
          >
            💬 {common("whatsappUs")}
          </a>
        </div>
      </div>
    </div>
  );
}
