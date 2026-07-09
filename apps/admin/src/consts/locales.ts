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
  { value: LocaleEnum.PORTUGUESE, label: "Portuguese" },
  // { value: LocaleEnum.SPANISH, label: "Spanish" },
] as const satisfies Locale[];
