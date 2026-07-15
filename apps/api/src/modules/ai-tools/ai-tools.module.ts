import { Module } from "@nestjs/common";
import { OpenRouterModule } from "@/integrations/open-router/open-router.module";
import { TavilyModule } from "@/integrations/tavily/tavily.module";
import { AiToolsResolver } from "./ai-tools.resolver";
import { AiToolsService } from "./ai-tools.service";
import { ChatService } from "./chat/chat.service";
import { ContextService } from "./context/context.service";

@Module({
  imports: [OpenRouterModule, TavilyModule],
  providers: [AiToolsResolver, AiToolsService, ChatService, ContextService],
})
export class AiToolsModule {}
