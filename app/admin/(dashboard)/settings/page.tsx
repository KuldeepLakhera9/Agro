import Link from "next/link";
import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";

export default async function SettingsPage() {
  await requireOwnerPage();
  const t = await getAdminTranslations("Admin.Settings");

  const LINKS = [
    { href: "/admin/settings/delivery-zones", label: t("deliveryZones"), desc: t("deliveryZonesDesc") },
    { href: "/admin/settings/users", label: t("usersRoles"), desc: t("usersRolesDesc") },
    { href: "/admin/audit-log", label: t("auditLog"), desc: t("auditLogDesc") },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-earth-200 bg-white p-5 hover:border-brand-300 hover:bg-brand-50"
          >
            <p className="font-semibold text-foreground">{l.label}</p>
            <p className="mt-1 text-sm text-foreground/60">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
