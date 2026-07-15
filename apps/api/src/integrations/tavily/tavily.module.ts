import { Module } from "@nestjs/common";
import { TavilyService } from "./tavily.service";
import { WebContentProvider } from "./web-content.provider";
import { WebSearchProvider } from "./web-search.provider";

@Module({
  exports: [WebContentProvider, WebSearchProvider],
  providers: [
    TavilyService,
    { provide: WebContentProvider, useExisting: TavilyService },
    { provide: WebSearchProvider, useExisting: TavilyService },
  ],
})
export class TavilyModule {}
