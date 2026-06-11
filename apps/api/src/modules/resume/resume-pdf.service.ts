import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { renderResumeDocument } from "./pdf/render-document";
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

      renderResumeDocument(pdf, document);
      pdf.end();
    });
  }
}
