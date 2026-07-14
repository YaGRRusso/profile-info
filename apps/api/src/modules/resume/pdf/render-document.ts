import { PdfContext } from "@/common/pdf/pdf-context";
import { resolveResumeLabels } from "../const/resume-labels.const";
import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderCertifications } from "./sections/render-certifications";
import { renderEducations } from "./sections/render-education";
import { renderExperiences } from "./sections/render-experience";
import { renderHeader } from "./sections/render-header";
import { renderProjects } from "./sections/render-projects";
import { renderSkills } from "./sections/render-skills";

export function renderResumeDocument(
  pdf: PDFKit.PDFDocument,
  document: ResumeDocumentData
): void {
  const labels = resolveResumeLabels(document.locale);
  const ctx = new PdfContext(pdf);

  renderHeader(ctx, document);
  renderSkills(ctx, document, labels.sections.skills);
  renderExperiences(ctx, document, labels.sections.experience);
  renderEducations(ctx, document, labels.sections.education);
  renderCertifications(
    ctx,
    document,
    labels.sections.certifications,
    labels.formatHours
  );
  renderProjects(ctx, document, labels.sections.projects);
}

export function createResumePdfOptions(
  document: ResumeDocumentData
): PDFKit.PDFDocumentOptions {
  return {
    info: {
      Author: document.header.name,
      Title: `${document.header.name} - CV`,
    },
    margin: 50,
    size: "A4",
  };
}
