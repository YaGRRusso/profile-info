import { DEFAULT_PDF_THEME } from "./default-pdf-theme";
import type { PdfSpacingKey } from "./pdf-spacing";
import type { PdfTextStyle } from "./pdf-text-style.type";
import type { PdfTextStyleKey, PdfTheme } from "./pdf-theme.type";

type PdfTextOptions = PDFKit.Mixins.TextOptions;

export class PdfContext {
  constructor(
    readonly document: PDFKit.PDFDocument,
    readonly theme: PdfTheme = DEFAULT_PDF_THEME
  ) {}

  text(
    styleKey: PdfTextStyleKey,
    content: string,
    options?: PdfTextOptions
  ): this {
    return this.textStyle(this.theme.textStyles[styleKey], content, options);
  }

  metaLine(
    parts: Array<string | undefined>,
    styleKey: PdfTextStyleKey = "meta"
  ): this {
    const meta = parts.filter(Boolean).join(" · ");
    if (!meta) return this;

    return this.text(styleKey, meta);
  }

  sectionTitle(title: string): this {
    const { colors } = this.theme;
    const normalizedTitle =
      this.theme.sectionTitleCase === "upper" ? title.toUpperCase() : title;

    this.gap("xl");
    this.text("sectionTitle", normalizedTitle);

    const lineY = this.document.y;
    this.horizontalRule({
      color: colors.rule,
      width: 1,
      y: lineY,
    });

    return this.gap("lg");
  }

  inlinePair(
    labelStyleKey: PdfTextStyleKey,
    label: string,
    valueStyleKey: PdfTextStyleKey,
    value: string,
    options?: { valueContinued?: boolean }
  ): this {
    this.text(labelStyleKey, label, { continued: true });
    this.text(valueStyleKey, value, {
      continued: options?.valueContinued,
    });

    return this;
  }

  horizontalRule(options: {
    color: string;
    width?: number;
    y?: number;
    fromX?: number;
    toX?: number;
  }): this {
    const { margins, width } = this.document.page;
    const y = options.y ?? this.document.y;

    this.document
      .moveTo(options.fromX ?? margins.left, y)
      .lineTo(options.toX ?? width - margins.right, y)
      .strokeColor(options.color)
      .lineWidth(options.width ?? 1)
      .stroke();

    return this;
  }

  accentBar(options: {
    color: string;
    fromX: number;
    length: number;
    width?: number;
    y: number;
  }): this {
    this.document
      .moveTo(options.fromX, options.y)
      .lineTo(options.fromX + options.length, options.y)
      .strokeColor(options.color)
      .lineWidth(options.width ?? 2)
      .stroke();

    return this;
  }

  gap(spacingKey: PdfSpacingKey): this {
    this.document.moveDown(this.theme.spacing[spacingKey]);
    return this;
  }

  ensureSpace(height: number): this {
    const bottom =
      this.document.page.height - this.document.page.margins.bottom;

    if (this.document.y + height <= bottom) return this;

    this.document.addPage();
    return this;
  }

  applyDefaultStyle(): this {
    const style = this.theme.textStyles[this.theme.defaultTextStyle];

    this.document.font(style.font).fillColor(style.color);

    return this;
  }

  private textStyle(
    style: PdfTextStyle,
    content: string,
    options?: PdfTextOptions
  ): this {
    this.document
      .font(style.font)
      .fontSize(style.size)
      .fillColor(style.color)
      .text(content, options);

    return this;
  }
}
