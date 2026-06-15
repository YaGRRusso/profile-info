import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";

export type PdfRenderCallback = (document: PDFKit.PDFDocument) => void;

@Injectable()
export class PdfRenderService {
  render(
    draw: PdfRenderCallback,
    options: PDFKit.PDFDocumentOptions = { size: "A4", margin: 50 }
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument(options);
      const chunks: Buffer[] = [];

      pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);

      draw(pdf);
      pdf.end();
    });
  }
}
