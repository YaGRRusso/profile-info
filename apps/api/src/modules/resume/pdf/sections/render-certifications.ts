import { renderEntryBlock } from "@/common/pdf/layout/render-entry-block";
import { renderSection } from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type { ResumeDocumentData } from "../../types/resume-document.type";

export function renderCertifications(
  ctx: PdfContext,
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
      });
    },
  });
}
