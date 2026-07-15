import type { TavilyExtractResponse } from "@tavily/core";
import type { WebContentResult } from "../web-content.provider";

export function tavilyExtractResultMapper(
  response: TavilyExtractResponse
): WebContentResult[] {
  if (!response.results?.length) return [];

  return response.results.map((result) => ({
    rawContent: result.rawContent,
    title: result.title ?? undefined,
    url: result.url,
  }));
}
