import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import {
  filterHeaderLinks,
  formatLinkTitle,
} from "./helpers/filter-header-links.helper";
import { formatSkillCategoryLabel } from "./helpers/format-skill-category.helper";
import { resolveResumeLabels } from "./resume.labels";
import { RESUME_PDF_THEME } from "./resume.pdf-theme";
import type { ResumeDocumentData } from "./types/resume-document.type";

const theme = RESUME_PDF_THEME;

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
    const { colors, fonts, spacing } = theme;

    const headerLeft = pdf.page.margins.left;

    pdf
      .font("Helvetica-Bold")
      .fontSize(fonts.headerName)
      .fillColor(colors.accent)
      .text(header.name);

    const nameBottom = pdf.y;
    pdf
      .moveTo(headerLeft, nameBottom + 4)
      .lineTo(headerLeft + 72, nameBottom + 4)
      .strokeColor(colors.accentSoft)
      .lineWidth(2)
      .stroke();

    pdf.moveDown(0.5);

    if (header.title) {
      pdf
        .font("Helvetica")
        .fontSize(fonts.headerSubtitle)
        .fillColor(colors.muted)
        .text(header.title);
      pdf.moveDown(0.55);
    }

    const contactParts = [header.email, header.phone].filter(Boolean);

    if (contactParts.length) {
      pdf
        .font("Helvetica")
        .fontSize(fonts.bodySmall)
        .fillColor(colors.body)
        .text(contactParts.join("  ·  "));
      pdf.moveDown(0.3);
    }

    const links = filterHeaderLinks(header.urls);

    if (links.length) {
      for (const [index, link] of links.entries()) {
        if (index > 0) {
          pdf
            .font("Helvetica")
            .fontSize(fonts.bodySmall)
            .fillColor(colors.muted)
            .text("  ·  ", { continued: true });
        }

        pdf
          .font("Helvetica-Bold")
          .fontSize(fonts.bodySmall)
          .fillColor(colors.accentSoft)
          .text(`${formatLinkTitle(link.title)}: `, { continued: true });

        pdf
          .font("Helvetica")
          .fillColor(colors.link)
          .text(link.value, { continued: index < links.length - 1 });
      }

      this.resetBodyStyle(pdf);
      pdf.moveDown(0.2);
    }

    pdf.moveDown(spacing.afterHeader);
  }

  private renderSectionTitle(pdf: PDFKit.PDFDocument, title: string) {
    const { colors, fonts, spacing } = theme;

    pdf.moveDown(spacing.beforeSection);
    pdf
      .font("Helvetica-Bold")
      .fontSize(fonts.section)
      .fillColor(colors.accent)
      .text(title.toUpperCase());
    const sectionLineY = pdf.y;
    pdf
      .moveTo(pdf.page.margins.left, sectionLineY)
      .lineTo(pdf.page.width - pdf.page.margins.right, sectionLineY)
      .strokeColor(colors.rule)
      .lineWidth(1)
      .stroke();
    pdf.moveDown(spacing.afterSectionTitle);
  }

  private renderSkillGroups(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.skills.length) return;

    const { colors, fonts, spacing } = theme;

    this.renderSectionTitle(pdf, title);

    for (const [index, group] of document.skills.entries()) {
      pdf
        .font("Helvetica-Bold")
        .fontSize(fonts.bodySmall)
        .fillColor(colors.accentSoft)
        .text(`${formatSkillCategoryLabel(group.category)}: `, {
          continued: true,
        });
      pdf
        .font("Helvetica")
        .fillColor(colors.body)
        .text(group.skills.join(", "));

      if (index < document.skills.length - 1) {
        pdf.moveDown(spacing.afterSkillGroup);
      }
    }
  }

  private renderExperiences(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.experiences.length) return;

    const { colors, fonts, spacing } = theme;

    this.renderSectionTitle(pdf, title);

    for (const experience of document.experiences) {
      for (const role of experience.roles) {
        this.ensureSpace(pdf, 72);

        pdf
          .font("Helvetica-Bold")
          .fontSize(fonts.roleTitle)
          .fillColor(colors.text)
          .text(role.title);

        this.renderMetaLine(pdf, [experience.organization, role.period]);

        pdf.moveDown(0.25);
        pdf
          .font("Helvetica")
          .fontSize(fonts.body)
          .fillColor(colors.body)
          .text(role.description);
        this.resetBodyStyle(pdf);
        pdf.moveDown(spacing.afterExperienceRole);
      }
    }
  }

  private renderEducations(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.educations.length) return;

    const { colors, fonts, spacing } = theme;

    this.renderSectionTitle(pdf, title);

    for (const education of document.educations) {
      this.ensureSpace(pdf, education.description ? 56 : 36);

      pdf
        .font("Helvetica-Bold")
        .fontSize(fonts.body)
        .fillColor(colors.text)
        .text(education.title);

      this.renderMetaLine(pdf, [education.organization, education.period]);

      if (education.description) {
        pdf.moveDown(0.25);
        pdf
          .font("Helvetica")
          .fontSize(fonts.body)
          .fillColor(colors.body)
          .text(education.description);
        this.resetBodyStyle(pdf);
      }

      pdf.moveDown(spacing.afterEducation);
    }
  }

  private renderCertifications(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string,
    formatHours: (hours: number) => string
  ) {
    if (!document.certifications.length) return;

    const { colors, fonts, spacing } = theme;

    this.renderSectionTitle(pdf, title);

    for (const certification of document.certifications) {
      this.ensureSpace(pdf, 36);

      pdf
        .font("Helvetica-Bold")
        .fontSize(fonts.body)
        .fillColor(colors.text)
        .text(certification.title);

      const hoursLabel =
        certification.hours === undefined
          ? undefined
          : formatHours(certification.hours);

      this.renderMetaLine(pdf, [certification.organization, hoursLabel]);

      pdf.moveDown(spacing.afterEducation);
    }
  }

  private renderProjects(
    pdf: PDFKit.PDFDocument,
    document: ResumeDocumentData,
    title: string
  ) {
    if (!document.projects.length) return;

    const { colors, fonts, spacing } = theme;

    this.renderSectionTitle(pdf, title);

    for (const project of document.projects) {
      this.ensureSpace(pdf, 48);

      pdf
        .font("Helvetica-Bold")
        .fontSize(fonts.body)
        .fillColor(colors.text)
        .text(project.title, {
          continued: Boolean(project.url),
        });

      if (project.url) {
        pdf
          .font("Helvetica")
          .fontSize(fonts.bodySmall)
          .fillColor(colors.link)
          .text(` (${project.url})`);
      }

      pdf.moveDown(0.2);
      pdf
        .font("Helvetica")
        .fontSize(fonts.body)
        .fillColor(colors.body)
        .text(project.description);
      this.resetBodyStyle(pdf);
      pdf.moveDown(spacing.afterProject);
    }
  }

  private renderMetaLine(
    pdf: PDFKit.PDFDocument,
    parts: Array<string | undefined>
  ) {
    const meta = parts.filter(Boolean).join("  ·  ");
    if (!meta) return;

    const { colors, fonts } = theme;

    pdf
      .font("Helvetica")
      .fontSize(fonts.bodySmall)
      .fillColor(colors.muted)
      .text(meta);
  }

  private resetBodyStyle(pdf: PDFKit.PDFDocument) {
    pdf.font("Helvetica").fillColor(theme.colors.text);
  }

  private ensureSpace(pdf: PDFKit.PDFDocument, height: number) {
    const bottom = pdf.page.height - pdf.page.margins.bottom;
    if (pdf.y + height <= bottom) return;

    pdf.addPage();
  }
}
