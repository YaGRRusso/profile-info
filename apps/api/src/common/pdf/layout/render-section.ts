import type { PdfContext } from "../pdf-context";
import type { PdfSpacingKey } from "../pdf-spacing";

export interface RenderSectionOptions<T> {
  itemGap?: PdfSpacingKey | false;
  items: T[];
  renderItem: (ctx: PdfContext, item: T, index: number) => void;
  title: string;
}

export function renderSection<T>(
  ctx: PdfContext,
  options: RenderSectionOptions<T>
): void {
  if (!options.items.length) return;

  const itemGap = options.itemGap ?? "md";

  ctx.sectionTitle(options.title);

  for (const [index, item] of options.items.entries()) {
    options.renderItem(ctx, item, index);

    if (itemGap !== false && index < options.items.length - 1) {
      ctx.gap(itemGap);
    }
  }
}
