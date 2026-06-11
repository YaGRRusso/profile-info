import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { resolveResumeLabels } from "./resume.labels";
import type { ResumeDocumentData } from "./types/resume-document.type";

@Injectable()
export class ResumePdfService {
  render(document: ResumeDocumentData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `${document.header.name} - CV`,
          Author: document.header.name,
        },
      });

      const chunks: Buffer[] = [];

      pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);

      this.renderDocument(pdf, document);
      pdf.end();
    });
  }

  private renderDocument(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData
  ) {
    const labels = resolveResumeLabels(document.locale);

    this.renderHeader(pdf, document);
    this.renderSkillGroups(pdf, document, labels.sections.skills);
    this.renderExperiences(pdf, document, labels.sections.experience);
    this.renderEducations(pdf, document, labels.sections.education);
    this.renderCertifications(
      pdf,
      document,
      labels.sections.certifications,
      labels.formatHours
    );
    this.renderProjects(pdf, document, labels.sections.projects);
  }

  private renderHeader(pdf: PDFKit.PDFDocument, document: ResumeDocumentData) {
    const { header } = document;

    pdf.font("Helvetica-Bold").fontSize(22).text(header.name);
    pdf.moveDown(0.3);

    if (header.title) {
      pdf
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#444444")
        .text(header.title);
      pdf.moveDown(0.5);
    }

    pdf.fillColor("#000000");

    const contactParts = [
      header.email,
      header.phone,
      ...header.urls.map(({ title, value }) => `${title}: ${value}`),
    ].filter(Boolean);

    if (contactParts.length) {
      pdf.font("Helvetica").fontSize(9).text(contactParts.join("  ·  "));
      pdf.moveDown(1);
    }
  }

  private renderSectionTitle(pdf: PDFKit.PDFDocument, title: string) {
    pdf.moveDown(0.5);
    pdf
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#000000")
      .text(title.toUpperCase());
    pdf
      .moveTo(pdf.x, pdf.y)
      .lineTo(pdf.page.width - pdf.page.margins.right, pdf.y)
      .strokeColor("#cccccc")
      .stroke();
    pdf.moveDown(0.4);
  }

  private renderSkillGroups(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.skills.length) return;

    this.renderSectionTitle(pdf, title);

    for (const group of document.skills) {
      pdf
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(`${group.category}: `, { continued: true });
      pdf.font("Helvetica").text(group.skills.join(", "));
    }
  }

  private renderExperiences(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.experiences.length) return;

    this.renderSectionTitle(pdf, title);

    for (const experience of document.experiences) {
      for (const role of experience.roles) {
        this.ensureSpace(pdf, 60);

        const headline = [experience.organization, role.title, role.period]
          .filter(Boolean)
          .join("  ·  ");

        pdf.font("Helvetica-Bold").fontSize(10).text(headline);
        pdf
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#333333")
          .text(role.description, { align: "justify" });
        pdf.fillColor("#000000");
        pdf.moveDown(0.4);
      }
    }
  }

  private renderEducations(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.educations.length) return;

    this.renderSectionTitle(pdf, title);

    for (const education of document.educations) {
      this.ensureSpace(pdf, 30);

      const line = [education.title, education.organization, education.period]
        .filter(Boolean)
        .join("  ·  ");

      pdf.font("Helvetica").fontSize(9).text(line);
      pdf.moveDown(0.2);
    }
  }

  private renderCertifications(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string,
    formatHours: (hours: number) => string
  ) {
    if (!document.certifications.length) return;

    this.renderSectionTitle(pdf, title);

    for (const certification of document.certifications) {
      this.ensureSpace(pdf, 30);

      const hoursLabel =
        certification.hours === undefined
          ? undefined
          : formatHours(certification.hours);

      const line = [certification.title, certification.organization, hoursLabel]
        .filter(Boolean)
        .join("  ·  ");

      pdf.font("Helvetica").fontSize(9).text(line);
      pdf.moveDown(0.2);
    }
  }

  private renderProjects(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.projects.length) return;

    this.renderSectionTitle(pdf, title);

    for (const project of document.projects) {
      this.ensureSpace(pdf, 40);

      pdf
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(project.title, {
          continued: Boolean(project.url),
        });

      if (project.url) {
        pdf
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#444444")
          .text(` (${project.url})`);
        pdf.fillColor("#000000");
      }

      pdf.moveDown(0.1);
      pdf
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#333333")
        .text(project.description, { align: "justify" });
      pdf.fillColor("#000000");
      pdf.moveDown(0.3);
    }
  }

  private ensureSpace(pdf: PDFKit.PDFDocument, height: number) {
    const bottom = pdf.page.height - pdf.page.margins.bottom;
    if (pdf.y + height <= bottom) return;

    pdf.addPage();
  }
}
