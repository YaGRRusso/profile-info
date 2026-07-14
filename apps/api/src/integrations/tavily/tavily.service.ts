import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  TavilyClient,
  TavilyCrawlOptions,
  TavilyCrawlResponse,
  TavilyExtractOptions,
  TavilyExtractResponse,
  TavilySearchOptions,
  TavilySearchResponse,
  tavily,
} from "@tavily/core";
import type { Env } from "@/core/configs/env.validation";
import {
  type WebContentExtractOptions,
  WebContentProvider,
  type WebContentResult,
} from "./web-content.provider";

@Injectable()
export class TavilyService extends WebContentProvider {
  private readonly client: TavilyClient;

  constructor(config: ConfigService<Env, true>) {
    super();

    this.client = tavily({ apiKey: config.getOrThrow("TAVILY_API_KEY") });
  }

  async search(
    query: string,
    options?: TavilySearchOptions
  ): Promise<TavilySearchResponse> {
    try {
      return await this.client.search(query, options);
    } catch (error) {
      throw new Error("Tavily search failed", { cause: error });
    }
  }

  async crawl(
    url: string,
    options?: TavilyCrawlOptions
  ): Promise<TavilyCrawlResponse> {
    try {
      return await this.client.crawl(url, options);
    } catch (error) {
      throw new Error("Tavily crawl failed", { cause: error });
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
      return mapTavilyExtractResponse(response);
    } catch (error) {
      throw new Error("Tavily extract failed", { cause: error });
    }
  }
}

function mapTavilyExtractResponse(
  response: TavilyExtractResponse
): WebContentResult[] {
  if (!response.results?.length) return [];

  return response.results.map((result) => ({
    rawContent: result.rawContent,
    title: result.title ?? undefined,
    url: result.url,
  }));
}
