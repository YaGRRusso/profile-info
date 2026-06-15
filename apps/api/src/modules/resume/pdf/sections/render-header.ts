import { renderLabeledLinks } from "@/common/pdf/layout/render-labeled-links";
import type { PdfContext } from "@/common/pdf/pdf-context";
import {
  filterHeaderLinks,
  formatLinkTitle,
} from "../../helpers/filter-header-links.helper";
import type { ResumeDocumentData } from "../../types/resume-document.type";

export function renderHeader(
  ctx: PdfContext,
  document: ResumeDocumentData
): void {
  const { header } = document;
  const { colors } = ctx.theme;
  const headerLeft = ctx.document.page.margins.left;

  ctx.text("display", header.name);

  ctx.accentBar({
    fromX: headerLeft,
    y: ctx.document.y + 4,
    length: 72,
    color: colors.accentSoft,
    width: 2,
  });

  ctx.gap("lg");

  if (header.title) {
    ctx.text("subtitle", header.title);
    ctx.gap("lg");
  }

  const contactParts = [header.email, header.phone].filter(Boolean);

  if (contactParts.length) {
    ctx.text("bodySmall", contactParts.join(" · "));
    ctx.gap("sm");
  }

  const links = filterHeaderLinks(header.urls).map((link) => ({
    label: `${formatLinkTitle(link.title)}: `,
    value: link.value,
  }));

  if (renderLabeledLinks(ctx, links)) {
    ctx.gap("xs");
  }

  if (header.description) {
    ctx.gap("md");
    ctx.text("body", header.description);
    ctx.applyDefaultStyle();
  }

  ctx.gap("block");
}
