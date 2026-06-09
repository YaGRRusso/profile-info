import { Module } from "@nestjs/common";
import { AiModule } from "@/integrations/ai/ai.module";
import { GithubModule } from "@/integrations/github/github.module";
import { TavilyModule } from "@/integrations/tavily/tavily.module";
import { AiToolsResolver } from "./ai-tools.resolver";
import { AiToolsService } from "./ai-tools.service";
import { ResourceDetailService } from "./resource-detail.service";

@Module({
  imports: [AiModule, GithubModule, TavilyModule],
  providers: [AiToolsResolver, AiToolsService, ResourceDetailService],
})
export class AiToolsModule {}
