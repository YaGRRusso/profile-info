import { renderSection } from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import { formatSkillCategoryLabel } from "../../helpers/format-skill-category.helper";
import type { ResumeDocumentData } from "../../types/resume-document.type";

export function renderSkills(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.skills,
    title,
    renderItem: (context, group) => {
      context.inlinePair(
        "label",
        `${formatSkillCategoryLabel(group.category)}: `,
        "body",
        group.skills.join(", ")
      );
    },
  });
}
