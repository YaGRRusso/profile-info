export const PDF_SPACING = {
  block: 1.2,
  lg: 0.5,
  md: 0.45,
  sm: 0.3,
  xl: 0.75,
  xs: 0.2,
} as const;

export type PdfSpacingKey = keyof typeof PDF_SPACING;
