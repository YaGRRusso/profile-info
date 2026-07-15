import type { WebSearchResult } from "@/integrations/tavily/web-search.provider";
import type { DetailInput } from "../dto/detail.input";

export function mapWebSearchResultToDetails(
  result: WebSearchResult
): DetailInput[] {
  return [
    {
      key: `Search (${result.url}) Title`,
      value: [result.title],
    },
    {
      key: `Search (${result.url}) Snippet`,
      value: [result.content],
    },
  ];
}
