import { Locale } from "@/generated/graphql/graphql";

export interface LocaleOption {
  label: string;
  value: Locale;
}

/** UI language options. Values are the GraphQL `Locale` enum — one source of truth. */
export const LOCALES = [
  { label: "English", value: Locale.En },
  { label: "Português", value: Locale.Pt },
  // { label: "Español", value: Locale.Es },
] as const satisfies LocaleOption[];

export function isLocale(value: string): value is Locale {
  return Object.values(Locale).some((locale) => locale === value);
}
