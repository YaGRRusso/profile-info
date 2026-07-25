import { isLocale } from "@/consts/locales";
import { Locale } from "@/generated/graphql/graphql";
import i18n from "@/i18n";

export function resolveActiveLocale(): Locale {
  const { language } = i18n;

  if (isLocale(language)) {
    return language;
  }

  const [base] = language.split("-");
  if (base && isLocale(base)) {
    return base;
  }

  return Locale.En;
}

export function createEmptyI18n<T extends Record<string, string>>(template: T) {
  return [{ locale: resolveActiveLocale(), ...template }];
}

export function pickTranslation<T extends { locale: string }>(
  entries: T[] | undefined,
  locale: string,
  fallbacks: readonly string[] = [Locale.En, Locale.Pt, Locale.Es]
): T | undefined {
  if (!entries?.length) return;

  const locales = [locale, ...fallbacks.filter((item) => item !== locale)];

  for (const candidate of locales) {
    const match = entries.find((entry) => entry.locale === candidate);
    if (match) return match;
  }

  return entries[0];
}

interface I18nSource {
  i18n?: Array<{ locale: string; messages: { title: string } }>;
  slug?: string | null;
}

export function i18nLabel(item: I18nSource, locale?: string): string {
  return (
    pickTranslation(item.i18n, locale ?? i18n.language)?.messages.title ??
    item.slug ??
    ""
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
