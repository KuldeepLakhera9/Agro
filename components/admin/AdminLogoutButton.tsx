"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminLogoutButton() {
  const router = useRouter();
  const t = useTranslations("Admin");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="ml-2 rounded-md border border-earth-300 px-3 py-1.5 text-sm font-medium text-earth-700 hover:bg-earth-50"
    >
      {t("logout")}
    </button>
  );
}
