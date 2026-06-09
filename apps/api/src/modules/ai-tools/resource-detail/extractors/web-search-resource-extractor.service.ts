import { Injectable } from "@nestjs/common";
import { WebContentProvider } from "@/integrations/tavily/web-content.provider";
import type { DetailInput } from "../../dto/detail.input";
import { ResourceType } from "../../enums/resource-type";
import type { ResourceExtractor } from "../resource-extractor.interface";

@Injectable()
export class WebSearchResourceExtractorService implements ResourceExtractor {
  readonly supportedTypes = [ResourceType.ORGANIZATION];
  readonly supportedKeys = ["website", "url", "link"];

  constructor(private readonly webContentProvider: WebContentProvider) {}

  accepts(): boolean {
    return true;
  }

  async extract(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const results = await this.webContentProvider.extract([url], {
      instructions:
        "Identify the main objective of this page and its target audience, extract the key information and main topics. Write a summary of the information presented on the page. Ignore forms and loading issues, focus on the real content.",
    });

    for (const result of results) {
      if (result.title) {
        extraDetails.push({
          key: `Website (${result.url}) Title`,
          value: [result.title],
        });
      }
      extraDetails.push({
        key: `Website (${result.url}) Scraped Summary`,
        value: [result.rawContent],
      });
    }

    return extraDetails;
  }
}
