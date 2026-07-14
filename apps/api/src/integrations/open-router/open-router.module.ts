import { Module } from "@nestjs/common";
import { AiChatProvider } from "./ai-chat.provider";
import { OpenRouterService } from "./open-router.service";

@Module({
  exports: [AiChatProvider],
  providers: [
    OpenRouterService,
    { provide: AiChatProvider, useClass: OpenRouterService },
  ],
})
export class OpenRouterModule {}
