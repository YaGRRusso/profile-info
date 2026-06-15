import { Controller, Get, Header, Query, StreamableFile } from "@nestjs/common";
import { normalizeLocale } from "@/common/i18n/locales";
import { Public } from "@/core/decorators/public-route.decorator";
import { PdfRenderService } from "@/core/pdf/pdf-render.service";
import {
  createResumePdfOptions,
  renderResumeDocument,
} from "./pdf/render-document";
import { ResumeService } from "./resume.service";

@Controller()
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly pdfRenderService: PdfRenderService
  ) {}

  @Get("resume.pdf")
  @Public()
  @Header("Content-Type", "application/pdf")
  async download(@Query("locale") localeQuery?: string) {
    const locale = normalizeLocale(localeQuery);
    const document = await this.resumeService.buildResume(locale);
    const buffer = await this.pdfRenderService.render(
      (pdf) => renderResumeDocument(pdf, document),
      createResumePdfOptions(document)
    );

    return new StreamableFile(buffer, {
      disposition: 'attachment; filename="resume.pdf"',
    });
  }
}
