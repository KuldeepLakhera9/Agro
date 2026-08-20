import { ADMIN_LOCALE_COOKIE } from "@/lib/adminLocaleCookie";

export function setAdminLocaleCookie(locale: string) {
  document.cookie = `${ADMIN_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000`;
}
