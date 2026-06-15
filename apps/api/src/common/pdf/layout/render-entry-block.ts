import type { PdfContext } from "../pdf-context";
import type { PdfSpacingKey } from "../pdf-spacing";
import type { PdfTextStyleKey } from "../pdf-theme.type";

export interface RenderEntryBlockOptions {
  description?: string;
  descriptionGap?: PdfSpacingKey;
  meta?: Array<string | undefined>;
  minHeight?: number;
  title: string;
  titleStyle?: PdfTextStyleKey;
  url?: string;
}

export function renderEntryBlock(
  ctx: PdfContext,
  options: RenderEntryBlockOptions
): void {
  if (options.minHeight !== undefined) {
    ctx.ensureSpace(options.minHeight);
  }

  ctx.text(options.titleStyle ?? "heading", options.title, {
    continued: Boolean(options.url),
  });

  if (options.url) {
    ctx.text("link", ` (${options.url})`);
  }

  if (options.meta?.some(Boolean)) {
    ctx.gap("sm");
    ctx.metaLine(options.meta);
    ctx.gap("sm");
  }

  if (options.description) {
    ctx.gap(options.descriptionGap ?? "xs");
    ctx.text("body", options.description);
    ctx.applyDefaultStyle();
  }
}
