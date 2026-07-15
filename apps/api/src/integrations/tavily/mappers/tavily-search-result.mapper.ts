import type { TavilySearchResponse } from "@tavily/core";
import type { WebSearchResult } from "../web-search.provider";

export function tavilySearchResultMapper(
  response: TavilySearchResponse
): WebSearchResult[] {
  if (!response.results?.length) return [];

  return response.results.map((result) => ({
    content: result.content,
    score: result.score,
    title: result.title,
    url: result.url,
  }));
}
