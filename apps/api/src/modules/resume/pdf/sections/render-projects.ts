import {
  entryBlockSectionHandlers,
  renderSection,
} from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type {
  ResumeDocumentData,
  ResumeProject,
} from "../../types/resume-document.type";

export function renderProjects(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.projects,
    title,
    ...entryBlockSectionHandlers<ResumeProject>((project) => ({
      title: project.title,
      url: project.url,
      description: project.description,
    })),
  });
}
