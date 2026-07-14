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
      color: colors.body,
      font: "Helvetica",
      size: 9.5,
    },
    bodySmall: {
      color: colors.body,
      font: "Helvetica",
      size: 9,
    },
    display: {
      color: colors.accent,
      font: "Helvetica-Bold",
      size: 24,
    },
    heading: {
      color: colors.text,
      font: "Helvetica-Bold",
      size: 10.5,
    },
    label: {
      color: colors.accentSoft,
      font: "Helvetica-Bold",
      size: 9,
    },
    link: {
      color: colors.link,
      font: "Helvetica",
      size: 9,
    },
    meta: {
      color: colors.muted,
      font: "Helvetica",
      size: 9,
    },
    sectionTitle: {
      color: colors.accent,
      font: "Helvetica-Bold",
      size: 11,
    },
    separator: {
      color: colors.muted,
      font: "Helvetica",
      size: 9,
    },
    subtitle: {
      color: colors.muted,
      font: "Helvetica",
      size: 12,
    },
  },
} as const satisfies PdfTheme;
