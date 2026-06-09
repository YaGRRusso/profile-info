import { Module } from "@nestjs/common";
import { TavilyService } from "./tavily.service";
import { WebContentProvider } from "./web-content.provider";

@Module({
  providers: [
    TavilyService,
    { provide: WebContentProvider, useClass: TavilyService },
  ],
  exports: [WebContentProvider],
})
export class TavilyModule {}
