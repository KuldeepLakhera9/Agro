import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BrandLogo from "./BrandLogo";
import { SITE, telLink, whatsappLink } from "@/lib/constants";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const contact = useTranslations("Contact");
  const common = useTranslations("Common");

  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-900 text-brand-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <BrandLogo variant="footer" />
          <p className="mt-4 text-xs leading-relaxed text-brand-200">
            {t("serviceArea")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-brand-800 px-2 py-1 text-brand-200">१००% नैसर्गिक घाणी तेल</span>
            <span className="rounded bg-brand-800 px-2 py-1 text-brand-200">मशिन क्लिनिंग व ग्रेडिंग</span>
          </div>
        </div>

        <div>
          <p className="font-semibold text-brand-100">{t("quickLinks")}</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li><Link href="/shop" className="hover:text-white transition-colors">{nav("shop")}</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">{nav("about")}</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">{nav("contact")}</Link></li>
            <li><Link href="/orders" className="hover:text-white transition-colors">{nav("orders")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-brand-100">{t("contactUs")}</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li>
              <a href={telLink(SITE.ownerPhone)} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>📞</span>
                <span>{contact("ownerContact")}: {SITE.ownerPhoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={telLink(SITE.companyPhone)} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>🏢</span>
                <span>{contact("companyContact")}: {SITE.companyPhoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(SITE.ownerPhone)}
                className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-300 font-medium"
              >
                <span>💬</span>
                <span>{common("whatsappUs")}</span>
              </a>
            </li>
            <li className="pt-1 text-xs text-brand-300 flex items-start gap-1.5">
              <span>📍</span>
              <span>{SITE.addressLine}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 px-4 py-4 text-center text-xs text-brand-300">
        &copy; {new Date().getFullYear()} {common("siteName")}. {t("rightsReserved")}
      </div>
    </footer>
  );
}
