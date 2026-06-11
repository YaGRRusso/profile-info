import type { ResumeSpacingKey, ResumeTextStyleKey } from "../resume.pdf-theme";
import type { ResumePdfContext } from "./resume-pdf.context";

export interface RenderEntryBlockOptions {
  description?: string;
  descriptionGap?: number;
  gap?: ResumeSpacingKey;
  meta?: Array<string | undefined>;
  minHeight?: number;
  title: string;
  titleStyle?: ResumeTextStyleKey;
}

export function renderEntryBlock(
  ctx: ResumePdfContext,
  options: RenderEntryBlockOptions
): void {
  if (options.minHeight !== undefined) {
    ctx.ensureSpace(options.minHeight);
  }

  ctx.text(options.titleStyle ?? "entryTitle", options.title);

  if (options.meta?.some(Boolean)) {
    ctx.metaLine(options.meta);
  }

  if (options.description) {
    ctx.gapLines(options.descriptionGap ?? 0.25);
    ctx.text("body", options.description);
    ctx.reset();
  }

  if (options.gap) {
    ctx.gap(options.gap);
  }
}
