import { PdfContext } from "@/common/pdf/pdf-context";
import {
  RESUME_PDF_THEME,
  type ResumeSpacingKey,
  type ResumeTextStyleKey,
} from "../resume.pdf-theme";

type PdfTextOptions = PDFKit.Mixins.TextOptions;

export class ResumePdfContext {
  readonly ctx: PdfContext;

  constructor(document: PDFKit.PDFDocument) {
    this.ctx = new PdfContext(document, RESUME_PDF_THEME.textStyles.body);
  }

  get document(): PDFKit.PDFDocument {
    return this.ctx.document;
  }

  text(
    styleKey: ResumeTextStyleKey,
    content: string,
    options?: PdfTextOptions
  ): this {
    this.ctx.text(RESUME_PDF_THEME.textStyles[styleKey], content, options);
    return this;
  }

  metaLine(parts: Array<string | undefined>): this {
    this.ctx.metaLine(parts, RESUME_PDF_THEME.textStyles.meta);
    return this;
  }

  sectionTitle(title: string): this {
    const { colors, spacing, textStyles } = RESUME_PDF_THEME;

    this.ctx.sectionTitle(title.toUpperCase(), {
      titleStyle: textStyles.sectionTitle,
      ruleColor: colors.rule,
      ruleWidth: 1,
      beforeGap: spacing.beforeSection,
      afterGap: spacing.afterSectionTitle,
    });

    return this;
  }

  inlinePair(
    labelStyleKey: ResumeTextStyleKey,
    label: string,
    valueStyleKey: ResumeTextStyleKey,
    value: string,
    options?: { valueContinued?: boolean }
  ): this {
    this.text(labelStyleKey, label, { continued: true });
    this.text(valueStyleKey, value, {
      continued: options?.valueContinued,
    });

    return this;
  }

  gap(spacingKey: ResumeSpacingKey): this {
    this.ctx.gap(RESUME_PDF_THEME.spacing[spacingKey]);
    return this;
  }

  gapLines(lines: number): this {
    this.ctx.gap(lines);
    return this;
  }

  ensureSpace(height: number): this {
    this.ctx.ensureSpace(height);
    return this;
  }

  reset(): this {
    this.document
      .font(RESUME_PDF_THEME.textStyles.body.font)
      .fillColor(RESUME_PDF_THEME.colors.text);

    return this;
  }
}
