"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function LogoutButton() {
  const t = useTranslations("Account");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border-2 border-earth-500 px-5 py-2.5 text-sm font-semibold text-earth-700 hover:bg-earth-50"
    >
      {t("logout")}
    </button>
  );
}
