import {
  DEFAULT_TRANSLATION_FALLBACKS,
  type LocaleCode,
} from "@/common/i18n/locales";

export function pickTranslation<T extends { locale: string }>(
  i18n: T[] | undefined,
  locale: LocaleCode | string,
  fallbacks: readonly string[] = DEFAULT_TRANSLATION_FALLBACKS
): T | undefined {
  if (!i18n?.length) return;

  const locales = [locale, ...fallbacks.filter((item) => item !== locale)];

  for (const candidate of locales) {
    const match = i18n.find((entry) => entry.locale === candidate);
    if (match) return match;
  }

  return i18n[0];
}
