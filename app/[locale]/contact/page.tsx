import { getTranslations } from "next-intl/server";
import { SITE, telLink, whatsappLink } from "@/lib/constants";

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  const common = await getTranslations("Common");

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold text-brand-800">{t("title")}</h1>
      <p className="mt-3 text-foreground/70">{t("subtitle")}</p>

      <div className="mt-8 space-y-5">
        <div className="rounded-xl border border-brand-100 p-5">
          <p className="font-semibold text-foreground">{t("ownerContact")}</p>
          <p className="mt-1 text-lg text-brand-700">{SITE.ownerPhoneDisplay}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={telLink(SITE.ownerPhone)}
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t("callButton")}
            </a>
            <a
              href={whatsappLink(SITE.ownerPhone)}
              className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("whatsappButton")}
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-brand-100 p-5">
          <p className="font-semibold text-foreground">{t("companyContact")}</p>
          <p className="mt-1 text-lg text-brand-700">{SITE.companyPhoneDisplay}</p>
          <a
            href={telLink(SITE.companyPhone)}
            className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t("callButton")}
          </a>
        </div>

        <div className="rounded-xl border border-brand-100 p-5">
          <p className="font-semibold text-foreground">{common("siteName")}</p>
          <p className="mt-1 text-foreground/70">{t("address")}</p>
        </div>
      </div>
    </div>
  );
}
