import { isNil } from "lodash";
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
      const hoursLabel = isNil(certification.hours)
        ? undefined
        : formatHours(certification.hours);

      return {
        description: certification.description,
        meta: [certification.organization, hoursLabel],
        title: certification.title,
      };
    }),
  });
}
