import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderEntryBlock } from "./render-entry-block";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderExperiences(
  ctx: ResumePdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  if (!document.experiences.length) return;

  ctx.sectionTitle(title);

  for (const experience of document.experiences) {
    for (const role of experience.roles) {
      renderEntryBlock(ctx, {
        title: role.title,
        titleStyle: "roleTitle",
        meta: [experience.organization, role.period],
        description: role.description,
        minHeight: 72,
        gap: "afterExperienceRole",
      });
    }
  }
}
