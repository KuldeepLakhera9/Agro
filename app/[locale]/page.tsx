import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveProducts } from "@/lib/queries/products";
import ProductCard from "@/components/shop/ProductCard";
import { SITE, telLink, whatsappLink } from "@/lib/constants";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const common = await getTranslations("Common");
  const products = await getActiveProducts();

  const badges = [
    t("badgeNatural"),
    t("badgeChemicalFree"),
    t("badgeGradeOne"),
    t("badgeHomeDelivery"),
  ];

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div>
      {/* Top Auspicious & Direct Service Ribbon */}
      <div className="border-b border-brand-100 bg-brand-50/70 py-1.5 text-center text-xs font-semibold text-brand-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <span className="text-earth-700">॥ श्री दत्त प्रसन्न ॥</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-200/80 px-2.5 py-0.5 text-[11px] font-bold text-brand-900">
            <span>🌿</span> शाखा नं. १ — रशीन (कर्जत)
          </span>
          <span className="hidden sm:inline text-brand-700">शेतकरी ते ग्राहक थेट सेवा</span>
        </div>
      </div>

      {/* Hero Section with Natural Photography */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50/60 via-background to-background px-4 pt-10 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-brand-200/70 bg-white px-3 py-1 text-xs font-bold text-brand-800 shadow-xs"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl lg:text-5xl leading-tight">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-full bg-brand-700 px-7 py-3.5 font-bold text-white shadow-md transition-all hover:bg-brand-800 hover:shadow-lg"
                >
                  {t("heroCta")}
                </Link>
                <Link
                  href="/about"
                  className="rounded-full border-2 border-brand-700 bg-white/80 px-7 py-3.5 font-bold text-brand-800 backdrop-blur transition-all hover:bg-brand-50"
                >
                  {t("heroSecondaryCta")}
                </Link>
              </div>

              {/* Direct call prompt */}
              <div className="mt-6 flex items-center gap-3 text-xs text-foreground/70">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>थेट चौकशी व ऑर्डरसाठी: </span>
                <a href={telLink(SITE.ownerPhone)} className="font-bold text-brand-800 underline hover:text-brand-900">
                  {SITE.ownerPhoneDisplay}
                </a>
              </div>
            </div>

            {/* Natural Hero Farm Showcase Image */}
            <div className="relative lg:col-span-6">
              <div className="relative aspect-16/10 overflow-hidden rounded-3xl border-2 border-brand-200/80 bg-white shadow-xl">
                <Image
                  src="/images/banner/hero-banner.jpg"
                  alt="आईसाहेब ॲग्रो इंडस्ट्रीज - शुद्ध घाणीचे तेल आणि स्वच्छ धान्य"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block rounded bg-brand-800/90 px-2 py-0.5 text-xs font-bold text-brand-100 backdrop-blur">
                    शेतकरी ते ग्राहक थेट सेवा
                  </span>
                  <p className="mt-1 text-sm font-semibold sm:text-base text-shadow">
                    १००% शुद्ध लाकडी घाणा तेल • स्वच्छ व ग्रेडिंग केलेले धान्य
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Highlights Directly from Banner */}
      <section className="mx-auto -mt-6 max-w-6xl px-4 relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1: Cold Pressed Oil */}
          <div className="flex items-start gap-4 rounded-2xl border border-brand-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl border border-amber-200">
              🫒
            </div>
            <div>
              <h3 className="font-bold text-brand-900">कोल्ड प्रेस तेल</h3>
              <p className="text-xs font-semibold text-amber-700">१००% शुद्ध • नैसर्गिक घाणा</p>
              <p className="mt-1 text-xs text-foreground/70 leading-relaxed">
                शेंगदाणा, सूर्यफूल आणि करडई तेल — कोणतेही मिश्रण किंवा रसायन नाही.
              </p>
            </div>
          </div>

          {/* Card 2: Farm Grains */}
          <div className="flex items-start gap-4 rounded-2xl border border-brand-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl border border-emerald-200">
              🌾
            </div>
            <div>
              <h3 className="font-bold text-brand-900">अन्नधान्य</h3>
              <p className="text-xs font-semibold text-emerald-700">गहू • ज्वारी (शाळू) • बाजरी</p>
              <p className="mt-1 text-xs text-foreground/70 leading-relaxed">
                घाऊक, किरकोळ आणि सोयीस्कर १kg, ५kg, २५kg पॅकिंगमध्ये उपलब्ध.
              </p>
            </div>
          </div>

          {/* Card 3: Machine Cleaning & Grading */}
          <div className="flex items-start gap-4 rounded-2xl border border-brand-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-2xl border border-sky-200">
              ⚙️
            </div>
            <div>
              <h3 className="font-bold text-brand-900">मशिन क्लिनिंग • ग्रेडिंग</h3>
              <p className="text-xs font-semibold text-sky-700">खडे व काडीकचरा मुक्त</p>
              <p className="mt-1 text-xs text-foreground/70 leading-relaxed">
                आधुनिक युनिटद्वारे स्वच्छ करून ग्रेड १ दर्जाचे दर्जेदार धान्य तयार.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{t("featuredTitle")}</h2>
            <p className="mt-1 text-sm text-foreground/70">{t("featuredSubtitle")}</p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold text-brand-700 hover:text-brand-900 transition-colors"
          >
            {common("viewAll")} →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Farm to Table Process */}
      <section className="bg-earth-50/80 border-y border-brand-100 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-brand-900 sm:text-3xl">
            {t("howItWorksTitle")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-white p-6 text-center border border-brand-100 shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white shadow-sm">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-bold text-brand-900">{s.title}</h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-brand-900 sm:text-3xl">
          {t("testimonialsTitle")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-xs">
              <div className="text-amber-500 text-sm mb-2">★★★★★</div>
              <p className="text-sm leading-relaxed text-foreground/80">
                "{t(`testimonial${i}` as never)}"
              </p>
              <p className="mt-4 text-sm font-bold text-brand-800">
                — {t(`testimonial${i}Author` as never)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA Strip */}
      <section className="bg-linear-to-r from-brand-900 via-brand-800 to-brand-900 px-4 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-brand-700/80 px-3 py-1 text-xs font-semibold text-brand-100">
            ॥ श्री दत्त प्रसन्न ॥ शाखा नं. १ (रशीन)
          </span>
          <h2 className="text-2xl font-bold sm:text-3xl">{t("contactStripTitle")}</h2>
          <p className="max-w-xl text-brand-100">{t("contactStripSubtitle")}</p>
          <p className="text-sm font-semibold text-amber-300">{t("ownerLine")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <a
              href={telLink(SITE.ownerPhone)}
              className="rounded-full bg-white px-6 py-3 font-bold text-brand-900 hover:bg-brand-50 shadow-md transition-all"
            >
              📞 {common("callNow")} — {SITE.ownerPhoneDisplay}
            </a>
            <a
              href={whatsappLink(SITE.ownerPhone)}
              className="rounded-full border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10 transition-all"
            >
              💬 {common("whatsappUs")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
