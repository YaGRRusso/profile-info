import { BadRequestException } from "@nestjs/common";
import { Locale } from "@/core/enums/locale.enum";
import { assertPreferredLocaleInLocales } from "./assert-preferred-locale-in-locales.helper";

describe("assertPreferredLocaleInLocales", () => {
  it("allows a preferred locale that is listed in locales", () => {
    expect(() =>
      assertPreferredLocaleInLocales(Locale.pt, [Locale.en, Locale.pt])
    ).not.toThrow();
  });

  it("allows omitting preferred locale", () => {
    expect(() =>
      assertPreferredLocaleInLocales(undefined, [Locale.en])
    ).not.toThrow();
  });

  it("rejects a preferred locale missing from locales", () => {
    expect(() =>
      assertPreferredLocaleInLocales(Locale.pt, [Locale.en])
    ).toThrow(BadRequestException);
  });

  it("rejects a preferred locale when locales are omitted", () => {
    expect(() => assertPreferredLocaleInLocales(Locale.en, undefined)).toThrow(
      BadRequestException
    );
  });

  it("rejects a preferred locale when locales are empty", () => {
    expect(() => assertPreferredLocaleInLocales(Locale.en, [])).toThrow(
      BadRequestException
    );
  });
});
