import { Module } from "@nestjs/common";
import { PdfRenderService } from "./pdf-render.service";

@Module({
  exports: [PdfRenderService],
  providers: [PdfRenderService],
})
export class PdfModule {}
