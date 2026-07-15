import { Injectable } from "@nestjs/common";
import { WebContentProvider } from "@/integrations/tavily/web-content.provider";
import type { DetailInput } from "../../dto/detail.input";
import type { ResourceExtractor } from "../resource-extractor.interface";

const URL_DETAIL_KEYS = [
  "website",
  "websites",
  "url",
  "urls",
  "link",
  "links",
  "reference",
  "references",
  "page",
  "pages",
  "document",
  "documents",
  "resource",
  "resources",
] as const;

@Injectable()
export class WebpageResourceExtractorService implements ResourceExtractor {
  readonly supportedKeys = [...URL_DETAIL_KEYS];

  constructor(private readonly webContentProvider: WebContentProvider) {}

  accepts(value: string): boolean {
    try {
      const url = new URL(value.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
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
