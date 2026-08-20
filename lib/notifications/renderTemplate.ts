import { createTranslator } from "use-intl/core";
import mr from "@/messages/mr.json";
import hi from "@/messages/hi.json";
import en from "@/messages/en.json";

const MESSAGES = { mr, hi, en };

export type NotifyLocale = keyof typeof MESSAGES;

type NotifyKey = keyof (typeof mr)["Notify"];

export function renderTemplate(
  locale: NotifyLocale,
  key: NotifyKey,
  values: Record<string, string | number>,
) {
  const t = createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: "Notify",
  });
  return t(key, values);
}
