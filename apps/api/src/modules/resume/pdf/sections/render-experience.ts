import {
  entryBlockSectionHandlers,
  renderSection,
} from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type {
  ResumeDocumentData,
  ResumeExperience,
} from "../../types/resume-document.type";

export function renderExperiences(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.experiences,
    title,
    ...entryBlockSectionHandlers<ResumeExperience>((experience) => ({
      description: experience.description,
      meta: [experience.organization, experience.period],
      title: experience.title,
    })),
  });
}
