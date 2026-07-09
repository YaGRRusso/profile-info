import { LocaleEnum } from "@/consts/locales";
import i18n from "@/i18n";

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

interface I18nSource {
  i18n?: Array<{ locale: string; messages: { title: string } }>;
  slug: string;
}

export function i18nLabel(item: I18nSource, locale?: string): string {
  return (
    pickTranslation(item.i18n, locale ?? i18n.language)?.messages.title ??
    item.slug
  );
}

export function i18nLabelsByIds(
  items: Array<I18nSource & { id: string }> | null | undefined,
  ids: string[] | null | undefined
): string[] {
  if (!ids?.length || !items?.length) return [];

  const byId = new Map(items.map((item) => [item.id, item]));

  return ids.map((id) => {
    const item = byId.get(id);
    return item ? i18nLabel(item) : "";
  });
}
