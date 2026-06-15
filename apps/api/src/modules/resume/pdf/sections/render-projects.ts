import { renderEntryBlock } from "@/common/pdf/layout/render-entry-block";
import { renderSection } from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type { ResumeDocumentData } from "../../types/resume-document.type";

export function renderProjects(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.projects,
    title,
    renderItem: (context, project) => {
      renderEntryBlock(context, {
        title: project.title,
        url: project.url,
        description: project.description,
        minHeight: 48,
      });
    },
  });
}
