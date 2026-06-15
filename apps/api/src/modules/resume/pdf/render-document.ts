import { resolveResumeLabels } from "../const/resume-labels.const";
import type { ResumeDocumentData } from "../types/resume-document.type";
import { renderCertifications } from "./render-certifications";
import { renderEducations } from "./render-education";
import { renderExperiences } from "./render-experience";
import { renderHeader } from "./render-header";
import { renderProjects } from "./render-projects";
import { renderSkills } from "./render-skills";
import { ResumePdfContext } from "./resume-pdf.context";

export function renderResumeDocument(
  pdf: PDFKit.PDFDocument,
  document: ResumeDocumentData
): void {
  const labels = resolveResumeLabels(document.locale);
  const ctx = new ResumePdfContext(pdf);

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
