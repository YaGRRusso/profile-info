import { Locale } from "@/common/i18n/locales";

/** Published Resend template aliases (dashboard). */
export const ResendMailTemplate = {
  registerEn: "register-en",
  registerPt: "register-pt",
} as const;

export function registerMailTemplateId(locale?: string): string {
  switch (locale) {
    case Locale.PT:
      return ResendMailTemplate.registerPt;
    case Locale.EN:
      return ResendMailTemplate.registerEn;
    default:
      return ResendMailTemplate.registerEn;
  }
}
