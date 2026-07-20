import type { I18nService } from "nestjs-i18n";
import type { LocaleCode } from "@/common/i18n/locales";
import { i18nKey } from "@/core/i18n/i18n";
import type { I18nPath } from "@/generated/i18n.generated";

export interface ResumeLabels {
  formatHours: (hours: number) => string;
  sections: {
    certifications: string;
    education: string;
    experience: string;
    projects: string;
    skills: string;
  };
}

export function resolveResumeLabels(
  i18n: Pick<I18nService, "t">,
  locale: LocaleCode
): ResumeLabels {
  const translate = (key: I18nPath, args?: Record<string, unknown>) =>
    i18n.t(key, { args, lang: locale }) as string;

  return {
    formatHours: (hours) =>
      translate(i18nKey("resume.FORMAT_HOURS"), { hours }),
    sections: {
      certifications: translate(i18nKey("resume.SECTION_CERTIFICATIONS")),
      education: translate(i18nKey("resume.SECTION_EDUCATION")),
      experience: translate(i18nKey("resume.SECTION_EXPERIENCE")),
      projects: translate(i18nKey("resume.SECTION_PROJECTS")),
      skills: translate(i18nKey("resume.SECTION_SKILLS")),
    },
  };
}
