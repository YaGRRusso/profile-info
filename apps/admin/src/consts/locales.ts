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
  { value: LocaleEnum.ENGLISH, label: "English" },
  { value: LocaleEnum.PORTUGUESE, label: "Português" },
  // { value: LocaleEnum.SPANISH, label: "Español" },
] as const satisfies Locale[];
