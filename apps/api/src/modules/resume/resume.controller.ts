import {
  BadRequestException,
  Controller,
  Get,
  Query,
  StreamableFile,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { assertValidObjectId } from "@/common/helpers/object-id.helper";
import { normalizeLocale } from "@/common/i18n/locales";
import { Public } from "@/core/decorators/public.decorator";
import { i18nKey } from "@/core/i18n/i18n";
import { PdfRenderService } from "@/core/pdf/pdf-render.service";
import { resolveResumeLabels } from "./const/resume-labels.const";
import {
  createResumePdfOptions,
  renderResumeDocument,
} from "./pdf/render-document";
import { ResumeService } from "./resume.service";

@Controller()
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly pdfRenderService: PdfRenderService,
    private readonly i18n: I18nService
  ) {}

  @Get("resume.pdf")
  @Public()
  async download(
    @Query("userId") userId: string | undefined,
    @Query("locale") localeQuery?: string
  ) {
    if (!userId)
      throw new BadRequestException(i18nKey("resume.USER_ID_REQUIRED"));
    assertValidObjectId(userId);

    const locale = normalizeLocale(localeQuery);
    const document = await this.resumeService.buildResume(userId, locale);
    const labels = resolveResumeLabels(this.i18n, locale);
    const buffer = await this.pdfRenderService.render(
      (pdf) => renderResumeDocument(pdf, document, labels),
      createResumePdfOptions(document)
    );

    return new StreamableFile(buffer, {
      disposition: 'attachment; filename="resume.pdf"',
      type: "application/pdf",
    });
  }
}
