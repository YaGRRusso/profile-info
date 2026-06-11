import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderEntryBlock } from "./render-entry-block";
import { renderSection } from "./render-section";
import type { ResumePdfContext } from "./resume-pdf.context";

export function renderCertifications(
  ctx: ResumePdfContext,
  document: ResumeDocumentData,
  title: string,
  formatHours: (hours: number) => string
): void {
  renderSection(ctx, {
    items: document.certifications,
    title,
    renderItem: (context, certification) => {
      const hoursLabel =
        certification.hours === undefined
          ? undefined
          : formatHours(certification.hours);

      renderEntryBlock(context, {
        title: certification.title,
        meta: [certification.organization, hoursLabel],
        minHeight: 36,
        gap: "afterEducation",
      });
    },
  });
}
