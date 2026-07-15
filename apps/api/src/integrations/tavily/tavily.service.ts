import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  TavilyClient,
  TavilyExtractOptions,
  TavilySearchOptions,
  tavily,
} from "@tavily/core";
import type { Env } from "@/core/configs/env.validation";
import { tavilyExtractResultMapper } from "./mappers/tavily-extract-result.mapper";
import { tavilySearchResultMapper } from "./mappers/tavily-search-result.mapper";
import {
  type WebContentExtractOptions,
  WebContentProvider,
  type WebContentResult,
} from "./web-content.provider";
import {
  type WebSearchOptions,
  type WebSearchResult,
} from "./web-search.provider";

@Injectable()
export class TavilyService extends WebContentProvider {
  private readonly client: TavilyClient;

  constructor(config: ConfigService<Env, true>) {
    super();

    this.client = tavily({ apiKey: config.getOrThrow("TAVILY_API_KEY") });
  }

  async search(
    query: string,
    options?: WebSearchOptions
  ): Promise<WebSearchResult[]> {
    const tavilyOptions: TavilySearchOptions | undefined = options?.maxResults
      ? { maxResults: options.maxResults }
      : undefined;

    try {
      const response = await this.client.search(query, tavilyOptions);
      return tavilySearchResultMapper(response);
    } catch (error) {
      throw new Error("Tavily search failed", { cause: error });
    }
  }

  async extract(
    urls: string[],
    options?: WebContentExtractOptions
  ): Promise<WebContentResult[]> {
    const tavilyOptions: TavilyExtractOptions | undefined =
      options?.instructions
        ? { instructions: options.instructions }
        : undefined;

    try {
      const response = await this.client.extract(urls, tavilyOptions);
      return tavilyExtractResultMapper(response);
    } catch (error) {
      throw new Error("Tavily extract failed", { cause: error });
    }
  }
}
