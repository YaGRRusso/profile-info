import { LocaleEnum } from "@/consts/locales";

const STORAGE_KEY = "display-locale";

export function readPersistedDisplayLocale(): LocaleEnum {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return LocaleEnum.ENGLISH;

    const parsed = JSON.parse(raw) as { state?: { locale?: string } };
    const locale = parsed.state?.locale;

    if (locale && Object.values(LocaleEnum).includes(locale as LocaleEnum)) {
      return locale as LocaleEnum;
    }
  } catch {
    // ignore malformed storage
  }

  return LocaleEnum.ENGLISH;
}
