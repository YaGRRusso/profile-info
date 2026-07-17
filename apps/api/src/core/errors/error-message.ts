import {
  LOCALES,
  type LocaleCode,
  localeFromAcceptLanguage,
} from "@/common/i18n/locales";

export type ErrorMessage = Record<LocaleCode, string>;

export function isErrorMessage(value: unknown): value is ErrorMessage {
  if (typeof value !== "object" || value === null) return false;

  return LOCALES.every((locale) => {
    if (!Object.hasOwn(value, locale)) return false;

    const entry = Reflect.get(value, locale);
    return typeof entry === "string";
  });
}

export function localizeError(
  message: ErrorMessage,
  acceptLanguage?: string
): string {
  const locale = localeFromAcceptLanguage(acceptLanguage);
  return message[locale];
}
