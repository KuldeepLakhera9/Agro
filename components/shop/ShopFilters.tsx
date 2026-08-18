"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ShopFilters({ resultsCount }: { resultsCount: number }) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = searchParams.get("category") ?? "all";
  const search = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateParamDebounced(key: string, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam(key, value), 350);
  }

  const categories: { value: string; label: string }[] = [
    { value: "all", label: t("categoryAll") },
    { value: "oil", label: t("categoryOil") },
    { value: "grain", label: t("categoryGrain") },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => updateParam("category", c.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 text-brand-800 hover:bg-brand-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground/60">
          {t("resultsCount", { count: resultsCount })}
        </span>
        <input
          type="search"
          defaultValue={search}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => updateParamDebounced("q", e.target.value)}
          className="w-full max-w-[220px] rounded-full border border-brand-200 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
