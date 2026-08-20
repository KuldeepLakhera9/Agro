"use client";

import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setAdminLocaleCookie } from "@/lib/setAdminLocaleCookie";

const LABELS: Record<string, string> = {
  mr: "मराठी",
  hi: "हिंदी",
  en: "English",
};

export default function AdminLanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function handleChange(next: string) {
    setAdminLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-earth-200 bg-white p-1 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          aria-current={loc === current}
          className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
            loc === current
              ? "bg-brand-600 text-white"
              : "text-foreground/70 hover:bg-earth-50"
          }`}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
