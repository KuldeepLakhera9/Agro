"use client";

import { useTranslations } from "next-intl";

export default function PrintButton() {
  const t = useTranslations("Admin");
  return (
    <button
      onClick={() => window.print()}
      className="mt-8 rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white print:hidden"
    >
      {t("printStatement")}
    </button>
  );
}
