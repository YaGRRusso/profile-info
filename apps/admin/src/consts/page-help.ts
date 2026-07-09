export interface PageHelpContent {
  paragraphs: string[];
  title: string;
}

export const PAGE_HELP_KEYS = [
  "home",
  "settings",
  "skills",
  "courses",
  "educations",
  "organizations",
  "projects",
  "experiences",
  "apiTokens",
] as const;

export type PageHelpKey = (typeof PAGE_HELP_KEYS)[number];
