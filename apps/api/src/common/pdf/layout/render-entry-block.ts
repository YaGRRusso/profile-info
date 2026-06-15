import type { PdfContext } from "../pdf-context";
import type { PdfSpacingKey } from "../pdf-spacing";
import type { PdfTextStyleKey } from "../pdf-theme.type";

export interface RenderEntryBlockOptions {
  description?: string;
  descriptionGap?: PdfSpacingKey;
  meta?: Array<string | undefined>;
  title: string;
  titleStyle?: PdfTextStyleKey;
  url?: string;
}

function measureTitleHeight(
  ctx: PdfContext,
  title: string,
  titleStyle: PdfTextStyleKey,
  url?: string
): number {
  if (!url) {
    return ctx.measureTextHeight(titleStyle, title);
  }

  const urlText = ` (${url})`;
  const contentWidth = ctx.contentWidth();
  const titleWidth = ctx.measureTextWidth(titleStyle, title);
  const urlWidth = ctx.measureTextWidth("link", urlText);

  if (titleWidth + urlWidth <= contentWidth) {
    return Math.max(
      ctx.measureLineHeight(titleStyle),
      ctx.measureLineHeight("link")
    );
  }

  return (
    ctx.measureTextHeight(titleStyle, title) +
    ctx.measureTextHeight("link", urlText)
  );
}

function measureEntryHeaderHeight(
  ctx: PdfContext,
  options: RenderEntryBlockOptions
): number {
  const titleStyle = options.titleStyle ?? "heading";
  let height = measureTitleHeight(ctx, options.title, titleStyle, options.url);

  const meta = options.meta?.filter(Boolean).join(" · ");

  if (meta) {
    height += ctx.measureGapHeight("xs", titleStyle);
    height += ctx.measureTextHeight("meta", meta);
    height += ctx.measureGapHeight("xs", "meta");
  }

  return height;
}

function measureEntryBlockHeight(
  ctx: PdfContext,
  options: RenderEntryBlockOptions
): number {
  let height = measureEntryHeaderHeight(ctx, options);

  if (options.description) {
    const descriptionGap = options.descriptionGap ?? "xs";

    height += ctx.measureGapHeight(descriptionGap, "meta");
    height += ctx.measureTextHeight("body", options.description);
  }

  return height;
}

export interface EntryBlockMeasurement {
  block: number;
  header: number;
}

export function measureEntryBlockHeights(
  ctx: PdfContext,
  options: RenderEntryBlockOptions
): EntryBlockMeasurement {
  return {
    block: measureEntryBlockHeight(ctx, options),
    header: measureEntryHeaderHeight(ctx, options),
  };
}

export function renderEntryBlock(
  ctx: PdfContext,
  options: RenderEntryBlockOptions
): void {
  const blockHeight = measureEntryBlockHeight(ctx, options);
  const headerHeight = measureEntryHeaderHeight(ctx, options);

  ctx.ensureBlockFits(blockHeight, headerHeight);

  ctx.text(options.titleStyle ?? "heading", options.title, {
    continued: Boolean(options.url),
  });

  if (options.url) {
    ctx.text("link", ` (${options.url})`);
  }

  if (options.meta?.some(Boolean)) {
    ctx.gap("xs");
    ctx.metaLine(options.meta);
    ctx.gap("xs");
  }

  if (options.description) {
    ctx.gap(options.descriptionGap ?? "xs");
    ctx.text("body", options.description);
    ctx.applyDefaultStyle();
  }
}
