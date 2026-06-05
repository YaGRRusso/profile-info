import { Injectable } from "@nestjs/common";
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

@Injectable()
export class WebSearchService {
  private readonly client: TavilyClient;

  constructor() {
    if (!process.env.TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY environment variable is not set");
    }

    this.client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
  }

  async search(
    query: string,
    options?: TavilySearchOptions
  ): Promise<TavilySearchResponse> {
    try {
      return await this.client.search(query, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async crawl(
    url: string,
    options?: TavilyCrawlOptions
  ): Promise<TavilyCrawlResponse> {
    try {
      return await this.client.crawl(url, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async extract(
    urls: string[],
    options?: TavilyExtractOptions
  ): Promise<TavilyExtractResponse> {
    try {
      return await this.client.extract(urls, options);
    } catch (error) {
      throw new Error(error);
    }
  }
}
