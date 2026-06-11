import { Locale } from "@/common/i18n/locales";
import { pickTranslation } from "./pick-translation.helper";

describe("pickTranslation", () => {
  const i18n = [
    { locale: Locale.EN, messages: { title: "Engineer" } },
    { locale: Locale.PT, messages: { title: "Engenheiro" } },
    { locale: Locale.ES, messages: { title: "Ingeniero" } },
  ];

  it("returns the requested locale when available", () => {
    expect(pickTranslation(i18n, Locale.PT)?.messages.title).toBe("Engenheiro");
  });

  it("falls back through the default chain when the locale is missing", () => {
    expect(
      pickTranslation(
        [{ locale: Locale.EN, messages: { title: "Engineer" } }],
        Locale.PT
      )?.messages.title
    ).toBe("Engineer");
  });

  it("returns the first entry when no fallback matches", () => {
    expect(
      pickTranslation(
        [{ locale: Locale.ES, messages: { title: "Ingeniero" } }],
        Locale.PT
      )?.messages.title
    ).toBe("Ingeniero");
  });

  it("returns undefined for empty input", () => {
    expect(pickTranslation(undefined, Locale.PT)).toBeUndefined();
  });
});
