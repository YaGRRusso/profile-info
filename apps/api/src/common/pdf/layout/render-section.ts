import type { PdfContext } from "../pdf-context";
import type { PdfSpacingKey } from "../pdf-spacing";
import {
  measureEntryBlockHeights,
  type RenderEntryBlockOptions,
  renderEntryBlock,
} from "./render-entry-block";

export interface SectionItemMeasurement {
  block: number;
  header?: number;
}

export interface RenderSectionOptions<T> {
  itemGap?: PdfSpacingKey | false;
  items: T[];
  measureItem: (ctx: PdfContext, item: T) => SectionItemMeasurement;
  renderItem: (ctx: PdfContext, item: T, index: number) => void;
  title: string;
}

export function entryBlockSectionHandlers<T>(
  toOptions: (item: T) => RenderEntryBlockOptions
): {
  measureItem: (ctx: PdfContext, item: T) => SectionItemMeasurement;
  renderItem: (ctx: PdfContext, item: T, index: number) => void;
} {
  return {
    measureItem: (ctx, item) => measureEntryBlockHeights(ctx, toOptions(item)),
    renderItem: (ctx, item, _index) => renderEntryBlock(ctx, toOptions(item)),
  };
}

function ensureSectionStartFits<T>(
  ctx: PdfContext,
  title: string,
  firstItem: T,
  measureItem: (ctx: PdfContext, item: T) => SectionItemMeasurement
): void {
  const sectionTitleHeight = ctx.measureSectionTitleHeight(title);
  const { block, header = block } = measureItem(ctx, firstItem);

  ctx.ensureBlockFits(sectionTitleHeight + block, sectionTitleHeight + header);
}

export function renderSection<T>(
  ctx: PdfContext,
  options: RenderSectionOptions<T>
): void {
  if (!options.items.length) return;

  const itemGap = options.itemGap ?? "md";
  const [firstItem] = options.items;

  if (firstItem !== undefined) {
    ensureSectionStartFits(ctx, options.title, firstItem, options.measureItem);
  }

  ctx.sectionTitle(options.title);

  for (const [index, item] of options.items.entries()) {
    options.renderItem(ctx, item, index);

    if (itemGap !== false && index < options.items.length - 1) {
      ctx.gap(itemGap);
    }
  }
}
