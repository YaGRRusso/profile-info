import { Locale, localeFromAcceptLanguage, normalizeLocale } from "./locales";

describe("locales", () => {
  it("normalizes supported locales and falls back to English", () => {
    expect(normalizeLocale("pt")).toBe(Locale.PT);
    expect(normalizeLocale("es")).toBe(Locale.ES);
    expect(normalizeLocale("fr")).toBe(Locale.EN);
    expect(normalizeLocale()).toBe(Locale.EN);
  });

  it("selects the first supported Accept-Language tag", () => {
    expect(localeFromAcceptLanguage("pt-BR,pt;q=0.9,en;q=0.8")).toBe(Locale.PT);
    expect(localeFromAcceptLanguage("es-ES,es;q=0.9")).toBe(Locale.ES);
    expect(localeFromAcceptLanguage("fr-FR,en;q=0.8")).toBe(Locale.EN);
    expect(localeFromAcceptLanguage()).toBe(Locale.EN);
  });
});
