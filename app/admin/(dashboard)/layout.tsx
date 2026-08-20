import Link from "next/link";
import { getAdminTranslations, getAdminLocale } from "@/lib/adminLocale";
import { requireAdminPage } from "@/lib/auth/requirePageRole";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();
  const locale = await getAdminLocale();
  const t = await getAdminTranslations("Admin.Nav");
  const tSettings = await getAdminTranslations("Admin.Settings");

  const NAV = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/orders", label: t("orders") },
    { href: "/admin/products", label: t("catalog") },
    { href: "/admin/procurement/purchase-requests", label: t("procurement") },
    { href: "/admin/farmers", label: t("farmers") },
    { href: "/admin/customers", label: t("customers") },
  ];
  const OWNER_NAV = [
    { href: "/admin/reports", label: t("reports") },
    { href: "/admin/settings", label: t("settings") },
  ];
  const nav = session.role === "owner" ? [...NAV, ...OWNER_NAV] : NAV;

  return (
    <div className="min-h-screen">
      <header className="border-b border-earth-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-bold text-brand-800">Aisaheb Agro — Admin</p>
            <p className="text-xs text-foreground/50">
              {session.phone} · {tSettings(session.role === "owner" ? "roleOwner" : "roleStaff")}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
            <AdminLanguageSwitcher current={locale} />
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
