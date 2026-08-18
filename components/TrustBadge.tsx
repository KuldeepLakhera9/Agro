import { useTranslations } from "next-intl";

const ICONS: Record<string, string> = {
  chemical_free: "🚫🧪",
  cold_pressed: "🌰",
  grade_1: "⭐",
};

export default function TrustBadge({ badge }: { badge: string }) {
  const t = useTranslations("Product");
  const label = t(`badge_${badge}` as never);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      <span aria-hidden>{ICONS[badge] ?? "✓"}</span>
      {label}
    </span>
  );
}
