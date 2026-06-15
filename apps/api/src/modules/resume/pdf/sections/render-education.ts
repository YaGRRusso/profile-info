import {
  entryBlockSectionHandlers,
  renderSection,
} from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type {
  ResumeDocumentData,
  ResumeEducation,
} from "../../types/resume-document.type";

export function renderEducations(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.educations,
    title,
    ...entryBlockSectionHandlers<ResumeEducation>((education) => ({
      title: education.title,
      meta: [education.organization, education.period],
      description: education.description,
    })),
  });
}
