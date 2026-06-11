import { LocaleEnum } from "@/consts/locales";

export const DEFAULT_FORM_LOCALES = [
  LocaleEnum.PORTUGUESE,
  LocaleEnum.ENGLISH,
] as const;

export function createEmptyI18n<T extends Record<string, string>>(template: T) {
  return DEFAULT_FORM_LOCALES.map((locale) => ({
    locale,
    ...template,
  }));
}

export function pickTranslation<T extends { locale: string }>(
  i18n: T[] | undefined,
  locale: string,
  fallbacks: readonly string[] = DEFAULT_FORM_LOCALES
): T | undefined {
  if (!i18n?.length) return;

  const locales = [locale, ...fallbacks.filter((item) => item !== locale)];

  for (const candidate of locales) {
    const match = i18n.find((entry) => entry.locale === candidate);
    if (match) return match;
  }

  return i18n[0];
}
