import type { LocaleCode } from "@/common/i18n/locales";

export interface ResumeContactLink {
  title: string;
  value: string;
}

export interface ResumeHeader {
  description?: string;
  email: string;
  name: string;
  phone?: string;
  title?: string;
  urls: ResumeContactLink[];
}

export interface ResumeSkillGroup {
  category: string;
  skills: string[];
}

export interface ResumeExperience {
  description: string;
  organization: string;
  period?: string;
  title: string;
}

export interface ResumeEducation {
  description?: string;
  organization: string;
  period?: string;
  title: string;
}

export interface ResumeCertification {
  description?: string;
  hours?: number;
  organization: string;
  title: string;
}

export interface ResumeProject {
  description: string;
  title: string;
  url?: string;
}

export interface ResumeDocumentData {
  certifications: ResumeCertification[];
  educations: ResumeEducation[];
  experiences: ResumeExperience[];
  header: ResumeHeader;
  locale: LocaleCode;
  projects: ResumeProject[];
  skills: ResumeSkillGroup[];
}
