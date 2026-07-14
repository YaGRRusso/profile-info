import { uniq } from "lodash";

export function hasUniqueLocales(items: { locale: string }[]): boolean {
  const locales = items.map((item) => item.locale);
  return uniq(locales).length === locales.length;
}
