import { formatSkillCategoryLabel } from "../helpers/format-skill-category.helper";
import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderSection } from "./render-section";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderSkills(
  ctx: ResumePdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.skills,
    title,
    renderItem: (context, group, index) => {
      context.inlinePair(
        "label",
        `${formatSkillCategoryLabel(group.category)}: `,
        "body",
        group.skills.join(", ")
      );

      if (index < document.skills.length - 1) {
        context.gap("afterSkillGroup");
      }
    },
  });
}
