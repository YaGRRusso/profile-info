export interface PdfTextStyle {
  color: string;
  font: string;
  size: number;
}

export interface PdfSectionTitleConfig {
  afterGap: number;
  beforeGap: number;
  ruleColor: string;
  ruleWidth?: number;
  titleStyle: PdfTextStyle;
}
