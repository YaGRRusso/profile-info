import { Module } from "@nestjs/common";
import { TavilyService } from "./tavily.service";
import { WebContentProvider } from "./web-content.provider";

@Module({
  exports: [WebContentProvider],
  providers: [
    TavilyService,
    { provide: WebContentProvider, useClass: TavilyService },
  ],
})
export class TavilyModule {}
