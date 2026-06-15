import type { PdfSpacingKey } from "./pdf-spacing";
import type { PdfTextStyle } from "./pdf-text-style.type";

export type PdfTextStyleKey =
  | "body"
  | "bodySmall"
  | "display"
  | "heading"
  | "label"
  | "link"
  | "meta"
  | "sectionTitle"
  | "separator"
  | "subtitle";

export interface PdfTheme {
  colors: {
    accent: string;
    accentSoft: string;
    body: string;
    link: string;
    muted: string;
    rule: string;
    text: string;
  };
  defaultTextStyle: PdfTextStyleKey;
  sectionTitleCase: "none" | "upper";
  spacing: Record<PdfSpacingKey, number>;
  textStyles: Record<PdfTextStyleKey, PdfTextStyle>;
}
