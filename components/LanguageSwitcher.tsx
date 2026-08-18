"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  mr: "मराठी",
  hi: "हिंदी",
  en: "English",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(next: string) {
    router.replace(
      // @ts-expect-error dynamic route params typed per-page
      { pathname, params },
      { locale: next },
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-brand-200 bg-white p-1 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          aria-current={loc === locale}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            loc === locale
              ? "bg-brand-600 text-white"
              : "text-brand-800 hover:bg-brand-50"
          }`}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
