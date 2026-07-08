import { Locale } from "@/common/i18n/locales";

export function organizationI18n(description: string, ptDescription?: string) {
  const entries = [
    { locale: Locale.EN, messages: { description } },
    ...(ptDescription
      ? [{ locale: Locale.PT, messages: { description: ptDescription } }]
      : []),
  ];

  return entries;
}
