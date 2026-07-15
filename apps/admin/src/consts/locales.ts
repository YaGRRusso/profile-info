export enum LocaleEnum {
  ENGLISH = "en",
  PORTUGUESE = "pt",
  SPANISH = "es",
}

export interface Locale {
  label: string;
  value: LocaleEnum;
}

export const LOCALES = [
  { label: "English", value: LocaleEnum.ENGLISH },
  { label: "Português", value: LocaleEnum.PORTUGUESE },
  // { value: LocaleEnum.SPANISH, label: "Español" },
] as const satisfies Locale[];

export function isLocaleEnum(value: string): value is LocaleEnum {
  return Object.values(LocaleEnum).some((locale) => locale === value);
}
