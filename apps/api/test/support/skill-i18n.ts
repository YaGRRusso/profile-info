import { Locale } from "@/common/i18n/locales";

export function skillI18n(title: string, ptTitle?: string) {
  const entries = [
    { locale: Locale.EN, messages: { title } },
    ...(ptTitle ? [{ locale: Locale.PT, messages: { title: ptTitle } }] : []),
  ];

  return entries;
}
