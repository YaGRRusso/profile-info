import {
  entryBlockSectionHandlers,
  renderSection,
} from "@/common/pdf/layout/render-section";
import type { PdfContext } from "@/common/pdf/pdf-context";
import type {
  ResumeCertification,
  ResumeDocumentData,
} from "../../types/resume-document.type";

export function renderCertifications(
  ctx: PdfContext,
  document: ResumeDocumentData,
  title: string,
  formatHours: (hours: number) => string
): void {
  renderSection(ctx, {
    items: document.certifications,
    title,
    ...entryBlockSectionHandlers<ResumeCertification>((certification) => {
      const hoursLabel =
        certification.hours === undefined
          ? undefined
          : formatHours(certification.hours);

      return {
        title: certification.title,
        meta: [certification.organization, hoursLabel],
        description: certification.description,
      };
    }),
  });
}
