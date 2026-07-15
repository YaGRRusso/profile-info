import { Module } from "@nestjs/common";
import { OpenRouterModule } from "@/integrations/open-router/open-router.module";
import { TavilyModule } from "@/integrations/tavily/tavily.module";
import { AiToolsResolver } from "./ai-tools.resolver";
import { AiToolsService } from "./ai-tools.service";
import { WebpageResourceExtractorService } from "./resource-detail/extractors/webpage-resource-extractor.service";
import { ResourceDetailService } from "./resource-detail/resource-detail.service";

@Module({
  imports: [OpenRouterModule, TavilyModule],
  providers: [
    AiToolsResolver,
    AiToolsService,
    WebpageResourceExtractorService,
    ResourceDetailService,
  ],
})
export class AiToolsModule {}
