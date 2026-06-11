import { Controller, Get, Header, Query, StreamableFile } from "@nestjs/common";
import { normalizeLocale } from "@/common/i18n/locales";
import { Public } from "@/core/decorators/public-route.decorator";
import { ResumeService } from "./resume.service";
import { ResumePdfService } from "./resume-pdf.service";

@Controller()
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumePdfService: ResumePdfService
  ) {}

  @Get("resume.pdf")
  @Public()
  @Header("Content-Type", "application/pdf")
  async download(@Query("locale") localeQuery?: string) {
    const locale = normalizeLocale(localeQuery);
    const document = await this.resumeService.buildResume(locale);
    const buffer = await this.resumePdfService.render(document);

    return new StreamableFile(buffer, {
      disposition: 'attachment; filename="resume.pdf"',
    });
  }
}
