import { Module } from "@nestjs/common";
import { AiChatProvider } from "./ai-chat.provider";
import { OpenRouterService } from "./open-router.service";

@Module({
  providers: [
    OpenRouterService,
    { provide: AiChatProvider, useClass: OpenRouterService },
  ],
  exports: [AiChatProvider],
})
export class OpenRouterModule {}
