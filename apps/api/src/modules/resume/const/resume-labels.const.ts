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
    formatHours: (hours) => `${hours} hours`,
    sections: {
      certifications: "Certifications",
      education: "Education",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
    },
  },
  [Locale.PT]: {
    formatHours: (hours) => `${hours} horas`,
    sections: {
      certifications: "Certificações",
      education: "Formação",
      experience: "Experiência",
      projects: "Projetos",
      skills: "Habilidades",
    },
  },
  [Locale.ES]: {
    formatHours: (hours) => `${hours} horas`,
    sections: {
      certifications: "Certificaciones",
      education: "Formación",
      experience: "Experiencia",
      projects: "Proyectos",
      skills: "Habilidades",
    },
  },
};

export function resolveResumeLabels(locale: LocaleCode): ResumeLabels {
  return RESUME_LABELS[locale] ?? RESUME_LABELS[Locale.EN];
}
