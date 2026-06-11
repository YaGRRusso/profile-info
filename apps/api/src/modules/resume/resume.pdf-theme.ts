import type { PdfTextStyle } from "@/common/pdf/pdf-text-style.type";

const colors = {
  accent: "#152025",
  accentSoft: "#152025",
  body: "#253035",
  link: "#204080",
  muted: "#253035",
  rule: "#152025",
  text: "#152025",
} as const;

const fonts = {
  body: 9.5,
  bodySmall: 9,
  headerName: 24,
  headerSubtitle: 12,
  roleTitle: 10.5,
  section: 11,
} as const;

const textStyles = {
  body: {
    font: "Helvetica",
    size: fonts.body,
    color: colors.body,
  },
  contact: {
    font: "Helvetica",
    size: fonts.bodySmall,
    color: colors.body,
  },
  entryTitle: {
    font: "Helvetica-Bold",
    size: fonts.body,
    color: colors.text,
  },
  headerName: {
    font: "Helvetica-Bold",
    size: fonts.headerName,
    color: colors.accent,
  },
  headerSubtitle: {
    font: "Helvetica",
    size: fonts.headerSubtitle,
    color: colors.muted,
  },
  label: {
    font: "Helvetica-Bold",
    size: fonts.bodySmall,
    color: colors.accentSoft,
  },
  link: {
    font: "Helvetica",
    size: fonts.bodySmall,
    color: colors.link,
  },
  meta: {
    font: "Helvetica",
    size: fonts.bodySmall,
    color: colors.muted,
  },
  roleTitle: {
    font: "Helvetica-Bold",
    size: fonts.roleTitle,
    color: colors.text,
  },
  sectionTitle: {
    font: "Helvetica-Bold",
    size: fonts.section,
    color: colors.accent,
  },
  separator: {
    font: "Helvetica",
    size: fonts.bodySmall,
    color: colors.muted,
  },
} as const satisfies Record<string, PdfTextStyle>;

export const RESUME_PDF_THEME = {
  colors,
  fonts,
  spacing: {
    afterHeader: 1.2,
    afterSectionTitle: 0.5,
    afterSkillGroup: 0.35,
    afterExperienceRole: 0.65,
    afterEducation: 0.45,
    afterProject: 0.5,
    beforeSection: 0.75,
  },
  textStyles,
} as const;

export type ResumeSpacingKey = keyof typeof RESUME_PDF_THEME.spacing;
export type ResumeTextStyleKey = keyof typeof RESUME_PDF_THEME.textStyles;
