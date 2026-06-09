import { Module } from "@nestjs/common";
import { AiProvider } from "./ai.provider";
import { OpenRouterService } from "./open-router/open-router.service";

@Module({
  providers: [
    OpenRouterService,
    { provide: AiProvider, useClass: OpenRouterService },
  ],
  exports: [AiProvider],
})
export class AiModule {}
