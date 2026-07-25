import { BadRequestException } from "@nestjs/common";
import { Locale } from "@/core/enums/locale.enum";
import { i18nKey } from "@/core/i18n/i18n";

export function assertPreferredLocaleInLocales(
  locale: Locale | undefined,
  locales: Locale[] | undefined
): void {
  if (locale === undefined) {
    return;
  }

  if (locales === undefined || !locales.includes(locale)) {
    throw new BadRequestException(
      i18nKey("users.PREFERRED_LOCALE_NOT_IN_LOCALES")
    );
  }
}
