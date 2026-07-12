export function hasUniqueLocales(items: { locale: string }[]): boolean {
  const locales = items.map((item) => item.locale);
  return new Set(locales).size === locales.length;
}
