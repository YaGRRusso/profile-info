import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderSection } from "./render-section";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderProjects(
  ctx: ResumePdfContext,
  document: ResumeDocumentData,
  title: string
): void {
  renderSection(ctx, {
    items: document.projects,
    title,
    renderItem: (context, project) => {
      context.ensureSpace(48);

      context.text("entryTitle", project.title, {
        continued: Boolean(project.url),
      });

      if (project.url) {
        context.text("link", ` (${project.url})`);
      }

      context.gapLines(0.2);
      context.text("body", project.description);
      context.reset();
      context.gap("afterProject");
    },
  });
}
