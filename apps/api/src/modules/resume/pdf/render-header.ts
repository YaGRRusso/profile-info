import {
  filterHeaderLinks,
  formatLinkTitle,
} from "../helpers/filter-header-links.helper";
import { RESUME_PDF_THEME } from "../resume.pdf-theme";
import type { ResumeDocumentData } from "../types/resume-document.type";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderHeader(
  ctx: ResumePdfContext,
  document: ResumeDocumentData
): void {
  const { header } = document;
  const { colors } = RESUME_PDF_THEME;
  const headerLeft = ctx.document.page.margins.left;

  ctx.text("headerName", header.name);

  const nameBottom = ctx.document.y;
  ctx.ctx.accentBar({
    fromX: headerLeft,
    y: nameBottom + 4,
    length: 72,
    color: colors.accentSoft,
    width: 2,
  });

  ctx.gapLines(0.5);

  if (header.title) {
    ctx.text("headerSubtitle", header.title);
    ctx.gapLines(0.55);
  }

  const contactParts = [header.email, header.phone].filter(Boolean);

  if (contactParts.length) {
    ctx.text("contact", contactParts.join("  ·  "));
    ctx.gapLines(0.3);
  }

  const links = filterHeaderLinks(header.urls);

  if (links.length) {
    for (const [index, link] of links.entries()) {
      if (index > 0) {
        ctx.text("separator", "  ·  ", { continued: true });
      }

      ctx.text("label", `${formatLinkTitle(link.title)}: `, {
        continued: true,
      });

      ctx.text("link", link.value, {
        continued: index < links.length - 1,
      });
    }

    ctx.reset();
    ctx.gapLines(0.2);
  }

  ctx.gap("afterHeader");
}
