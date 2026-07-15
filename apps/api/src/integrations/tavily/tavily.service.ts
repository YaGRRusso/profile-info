import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  TavilyClient,
  TavilyExtractOptions,
  TavilySearchOptions,
  tavily,
} from "@tavily/core";
import type { Env } from "@/core/configs/env.validation";
import { mapTavilyExtractResponse } from "./mappers/tavily-extract-result.mapper";
import { mapTavilySearchResponse } from "./mappers/tavily-search-result.mapper";
import {
  type WebContentExtractOptions,
  WebContentProvider,
  type WebContentResult,
} from "./web-content.provider";
import {
  type WebSearchOptions,
  WebSearchProvider,
  type WebSearchResult,
} from "./web-search.provider";

@Injectable()
export class TavilyService implements WebContentProvider, WebSearchProvider {
  private readonly client: TavilyClient;

  constructor(config: ConfigService<Env, true>) {
    this.client = tavily({ apiKey: config.getOrThrow("TAVILY_API_KEY") });
  }

  async search(
    query: string,
    options?: WebSearchOptions
  ): Promise<WebSearchResult[]> {
    const tavilyOptions: TavilySearchOptions = {
      includeImageDescriptions: false,
      includeImages: false,
      maxResults: options?.maxResults ?? 5,
      searchDepth: "basic",
    };

    try {
      const response = await this.client.search(query, tavilyOptions);
      return mapTavilySearchResponse(response);
    } catch (error) {
      throw new Error("Tavily search failed", { cause: error });
    }
  }

  async extract(
    urls: string[],
    options?: WebContentExtractOptions
  ): Promise<WebContentResult[]> {
    const tavilyOptions: TavilyExtractOptions = {
      extractDepth: "basic",
      includeImages: false,
      instructions: options?.instructions,
    };

    try {
      const response = await this.client.extract(urls, tavilyOptions);
      return mapTavilyExtractResponse(response);
    } catch (error) {
      throw new Error("Tavily extract failed", { cause: error });
    }
  }
}
