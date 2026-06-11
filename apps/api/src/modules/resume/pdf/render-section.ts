import type { ResumePdfContext } from "./resume-pdf.context";

export interface RenderSectionOptions<T> {
  items: T[];
  renderItem: (ctx: ResumePdfContext, item: T, index: number) => void;
  title: string;
}

export function renderSection<T>(
  ctx: ResumePdfContext,
  options: RenderSectionOptions<T>
): void {
  if (!options.items.length) return;

  ctx.sectionTitle(options.title);

  for (const [index, item] of options.items.entries()) {
    options.renderItem(ctx, item, index);
  }
}
