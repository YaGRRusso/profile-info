import type {
  PdfSectionTitleConfig,
  PdfTextStyle,
} from "./pdf-text-style.type";

type PdfTextOptions = PDFKit.Mixins.TextOptions;

export class PdfContext {
  constructor(
    readonly document: PDFKit.PDFDocument,
    private readonly defaultStyle: PdfTextStyle
  ) {}

  text(style: PdfTextStyle, content: string, options?: PdfTextOptions): this {
    this.document
      .font(style.font)
      .fontSize(style.size)
      .fillColor(style.color)
      .text(content, options);

    return this;
  }

  metaLine(
    parts: Array<string | undefined>,
    style: PdfTextStyle,
    separator = "  ·  "
  ): this {
    const meta = parts.filter(Boolean).join(separator);
    if (!meta) return this;

    return this.text(style, meta);
  }

  sectionTitle(title: string, config: PdfSectionTitleConfig): this {
    this.gap(config.beforeGap);
    this.text(config.titleStyle, title);

    const lineY = this.document.y;
    this.horizontalRule({
      color: config.ruleColor,
      width: config.ruleWidth ?? 1,
      y: lineY,
    });

    return this.gap(config.afterGap);
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

  gap(lines: number): this {
    this.document.moveDown(lines);
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
    this.document
      .font(this.defaultStyle.font)
      .fillColor(this.defaultStyle.color);

    return this;
  }
}
