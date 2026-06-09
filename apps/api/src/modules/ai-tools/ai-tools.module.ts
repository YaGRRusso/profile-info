import { Module } from "@nestjs/common";
import { GithubModule } from "@/integrations/github/github.module";
import { OpenRouterModule } from "@/integrations/open-router/open-router.module";
import { TavilyModule } from "@/integrations/tavily/tavily.module";
import { AiToolsResolver } from "./ai-tools.resolver";
import { AiToolsService } from "./ai-tools.service";
import { GithubResourceExtractorService } from "./resource-detail/extractors/github-resource-extractor.service";
import { WebSearchResourceExtractorService } from "./resource-detail/extractors/web-search-resource-extractor.service";
import { ResourceDetailService } from "./resource-detail/resource-detail.service";

@Module({
  imports: [OpenRouterModule, GithubModule, TavilyModule],
  providers: [
    AiToolsResolver,
    AiToolsService,
    GithubResourceExtractorService,
    WebSearchResourceExtractorService,
    ResourceDetailService,
  ],
})
export class AiToolsModule {}
