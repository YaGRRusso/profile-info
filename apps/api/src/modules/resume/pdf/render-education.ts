import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderEntryBlock } from "./render-entry-block";
import { renderSection } from "./render-section";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderEducations(
  ctx: ResumePdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.educations,
    title,
    renderItem: (context, education) => {
      renderEntryBlock(context, {
        title: education.title,
        meta: [education.organization, education.period],
        description: education.description,
        minHeight: education.description ? 56 : 36,
        gap: "afterEducation",
      });
    },
  });
}
