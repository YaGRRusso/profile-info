import {
  BadRequestException,
  Controller,
  Get,
  Query,
  StreamableFile,
} from "@nestjs/common";
import { assertValidObjectId } from "@/common/helpers/object-id.helper";
import { normalizeLocale } from "@/common/i18n/locales";
import { Public } from "@/core/decorators/public.decorator";
import { PdfRenderService } from "@/core/pdf/pdf-render.service";
import {
  createResumePdfOptions,
  renderResumeDocument,
} from "./pdf/render-document";
import { RESUME_USER_ID_REQUIRED } from "./resume.messages";
import { ResumeService } from "./resume.service";

@Controller()
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly pdfRenderService: PdfRenderService
  ) {}

  @Get("resume.pdf")
  @Public()
  async download(
    @Query("userId") userId: string | undefined,
    @Query("locale") localeQuery?: string
  ) {
    if (!userId) throw new BadRequestException(RESUME_USER_ID_REQUIRED);
    assertValidObjectId(userId);

    const locale = normalizeLocale(localeQuery);
    const document = await this.resumeService.buildResume(userId, locale);
    const buffer = await this.pdfRenderService.render(
      (pdf) => renderResumeDocument(pdf, document),
      createResumePdfOptions(document)
    );

    return new StreamableFile(buffer, {
      disposition: 'attachment; filename="resume.pdf"',
      type: "application/pdf",
    });
  }
}
