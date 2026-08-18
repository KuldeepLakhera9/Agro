import type { AppLocale } from "@/i18n/routing";

export interface LocalizedString {
  mr: string;
  hi: string;
  en: string;
}

export function pick(field: LocalizedString, locale: string): string {
  return field[locale as AppLocale] ?? field.en;
}
