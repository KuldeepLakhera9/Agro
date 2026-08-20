import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { ADMIN_LOCALE_COOKIE } from "@/lib/adminLocaleCookie";

export { ADMIN_LOCALE_COOKIE };

export async function getAdminLocale(): Promise<AppLocale> {
  const jar = await cookies();
  const value = jar.get(ADMIN_LOCALE_COOKIE)?.value;
  return (routing.locales as readonly string[]).includes(value ?? "")
    ? (value as AppLocale)
    : "en";
}

/**
 * `next-intl`'s own `getTranslations()` resolves locale via the storefront's
 * request-locale mechanism (i18n/request.ts — URL segment / NEXT_LOCALE
 * cookie), which doesn't exist under /admin (no [locale] segment). Left
 * unguarded it silently falls back to routing.defaultLocale on every call,
 * ignoring admin_locale entirely. Server Components under /admin must use
 * this wrapper instead of importing getTranslations directly.
 */
export async function getAdminTranslations<Namespace extends string = never>(
  namespace?: Namespace,
) {
  const locale = await getAdminLocale();
  return getTranslations({ locale, namespace } as never);
}
