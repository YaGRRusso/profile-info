import dayjsLib from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/pt";
import relativeTime from "dayjs/plugin/relativeTime";
import { LocaleEnum } from "@/consts/locales";

dayjsLib.extend(relativeTime);

export const dayjs = dayjsLib;

const DAYJS_LOCALE: Record<LocaleEnum, string> = {
  [LocaleEnum.ENGLISH]: "en",
  [LocaleEnum.PORTUGUESE]: "pt",
  [LocaleEnum.SPANISH]: "es",
};

export function syncDayjsLocale(locale: LocaleEnum) {
  dayjsLib.locale(DAYJS_LOCALE[locale] ?? "en");
}

export function formatRelativeTime(value: string | Date): string {
  return dayjs(value).fromNow();
}
