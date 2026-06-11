import { Locale, type LocaleCode } from "@/common/i18n/locales";

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

const RESUME_LABELS: Record<LocaleCode, ResumeLabels> = {
  [Locale.EN]: {
    sections: {
      certifications: "Certifications",
      education: "Education",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
    },
    formatHours: (hours) => `${hours} hours`,
  },
  [Locale.PT]: {
    sections: {
      certifications: "Certificações",
      education: "Formação",
      experience: "Experiência",
      projects: "Projetos",
      skills: "Habilidades",
    },
    formatHours: (hours) => `${hours} horas`,
  },
  [Locale.ES]: {
    sections: {
      certifications: "Certificaciones",
      education: "Formación",
      experience: "Experiencia",
      projects: "Proyectos",
      skills: "Habilidades",
    },
    formatHours: (hours) => `${hours} horas`,
  },
};

export function resolveResumeLabels(locale: LocaleCode): ResumeLabels {
  return RESUME_LABELS[locale] ?? RESUME_LABELS[Locale.EN];
}
