import dayjsLib from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/pt";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Locale } from "@/generated/graphql/graphql";

dayjsLib.extend(relativeTime);

export const dayjs = dayjsLib;

export function syncDayjsLocale(locale: Locale) {
  dayjsLib.locale(locale);
}

export function formatRelativeTime(value: string | Date): string {
  return dayjs(value).fromNow();
}
