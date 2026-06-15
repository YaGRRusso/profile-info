import { PDF_SPACING } from "./pdf-spacing";
import type { PdfTheme } from "./pdf-theme.type";

const colors = {
  accent: "#152025",
  accentSoft: "#152025",
  body: "#253035",
  link: "#204080",
  muted: "#253035",
  rule: "#152025",
  text: "#152025",
} as const;

export const DEFAULT_PDF_THEME = {
  colors,
  defaultTextStyle: "body",
  sectionTitleCase: "upper",
  spacing: PDF_SPACING,
  textStyles: {
    body: {
      font: "Helvetica",
      size: 9.5,
      color: colors.body,
    },
    bodySmall: {
      font: "Helvetica",
      size: 9,
      color: colors.body,
    },
    display: {
      font: "Helvetica-Bold",
      size: 24,
      color: colors.accent,
    },
    heading: {
      font: "Helvetica-Bold",
      size: 10.5,
      color: colors.text,
    },
    label: {
      font: "Helvetica-Bold",
      size: 9,
      color: colors.accentSoft,
    },
    link: {
      font: "Helvetica",
      size: 9,
      color: colors.link,
    },
    meta: {
      font: "Helvetica",
      size: 9,
      color: colors.muted,
    },
    sectionTitle: {
      font: "Helvetica-Bold",
      size: 11,
      color: colors.accent,
    },
    separator: {
      font: "Helvetica",
      size: 9,
      color: colors.muted,
    },
    subtitle: {
      font: "Helvetica",
      size: 12,
      color: colors.muted,
    },
  },
} as const satisfies PdfTheme;
