export const PDF_SPACING = {
  xs: 0.2,
  sm: 0.3,
  md: 0.45,
  lg: 0.5,
  xl: 0.75,
  block: 1.2,
} as const;

export type PdfSpacingKey = keyof typeof PDF_SPACING;
