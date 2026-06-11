export const Locale = {
  EN: "en",
  PT: "pt",
  ES: "es",
} as const;

export type LocaleCode = (typeof Locale)[keyof typeof Locale];

export const DEFAULT_LOCALE: LocaleCode = Locale.EN;

/** App-owned locales (resume PDF, future API copy). Not a constraint on entity i18n. */
export const SUPPORTED_CONTENT_LOCALES = [
  Locale.EN,
  Locale.PT,
  Locale.ES,
] as const;

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

export function normalizeLocale(input?: string): LocaleCode {
  if (input && SUPPORTED_CONTENT_LOCALES.includes(input as LocaleCode)) {
    return input as LocaleCode;
  }

  return DEFAULT_LOCALE;
}
