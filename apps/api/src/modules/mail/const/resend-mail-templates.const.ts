import { Locale } from "@/core/enums/locale.enum";

/** Published Resend template aliases (dashboard). */
export const ResendMailTemplate = {
  registerEn: "register-en",
  registerPt: "register-pt",
} as const;

export function registerMailTemplateId(locale?: Locale): string {
  switch (locale) {
    case Locale.pt:
      return ResendMailTemplate.registerPt;
    default:
      return ResendMailTemplate.registerEn;
  }
}
