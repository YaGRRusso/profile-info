import { renderSection } from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import { formatSkillCategoryLabel } from "../../helpers/format-skill-category.helper";
import type {
  ResumeDocumentData,
  ResumeSkillGroup,
} from "../../types/resume-document.type";

function isUncategorizedSkillGroup(group: ResumeSkillGroup): boolean {
  return group.category.trim().length === 0;
}

function measureSkillGroupHeight(
  ctx: PdfContext,
  group: ResumeSkillGroup
): number {
  const skillsText = group.skills.join(", ");

  if (isUncategorizedSkillGroup(group)) {
    return ctx.measureTextHeight("body", skillsText);
  }

  return ctx.measureInlinePairHeight(
    "label",
    `${formatSkillCategoryLabel(group.category)}: `,
    "body",
    skillsText
  );
}

function renderSkillGroup(ctx: PdfContext, group: ResumeSkillGroup): void {
  const skillsText = group.skills.join(", ");

  if (isUncategorizedSkillGroup(group)) {
    ctx.text("body", skillsText);
    return;
  }

  ctx.inlinePair(
    "label",
    `${formatSkillCategoryLabel(group.category)}: `,
    "body",
    skillsText
  );
}

export function renderSkills(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.skills,
    title,
    measureItem: (context, group) => {
      const lineHeight = measureSkillGroupHeight(context, group);

      return { block: lineHeight, header: lineHeight };
    },
    renderItem: (context, group) => {
      renderSkillGroup(context, group);
    },
  });
}
