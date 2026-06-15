import { renderEntryBlock } from "@/common/pdf/layout/render-entry-block";
import { renderSection } from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type { ResumeDocumentData } from "../../types/resume-document.type";

export function renderEducations(
  ctx: PdfContext,
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
      });
    },
  });
}
