export const Locale = {
  EN: "en",
  ES: "es",
  PT: "pt",
} as const;

export type LocaleCode = (typeof Locale)[keyof typeof Locale];

export const DEFAULT_LOCALE: LocaleCode = Locale.EN;

/** App-owned locales (resume PDF, API error messages). */
export const LOCALES: readonly LocaleCode[] = Object.values(Locale);

export const DEFAULT_TRANSLATION_FALLBACKS = [
  Locale.PT,
  Locale.EN,
  Locale.ES,
] as const;

export const INTL_LOCALES: Record<LocaleCode, string> = {
  [Locale.EN]: "en-US",
  [Locale.PT]: "pt-BR",
  [Locale.ES]: "es-ES",
};

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((locale) => locale === value);
}

export function normalizeLocale(input?: string): LocaleCode {
  if (input && isLocaleCode(input)) return input;
  return DEFAULT_LOCALE;
}

export function localeFromAcceptLanguage(header?: string): LocaleCode {
  if (!header) return DEFAULT_LOCALE;

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    const primary = tag.split("-")[0] ?? tag;
    if (isLocaleCode(primary)) return primary;
  }

  return DEFAULT_LOCALE;
}
