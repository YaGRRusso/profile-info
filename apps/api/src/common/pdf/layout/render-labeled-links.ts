import type { PdfContext } from "../pdf-context";

export interface PdfLabeledLink {
  label: string;
  value: string;
}

export function renderLabeledLinks(
  ctx: PdfContext,
  links: PdfLabeledLink[]
): boolean {
  if (!links.length) return false;

  for (const [index, link] of links.entries()) {
    if (index > 0) {
      ctx.text("separator", " · ", { continued: true });
    }

    ctx.text("label", link.label, { continued: true });
    ctx.text("link", link.value, {
      continued: index < links.length - 1,
    });
  }

  ctx.applyDefaultStyle();
  return true;
}
