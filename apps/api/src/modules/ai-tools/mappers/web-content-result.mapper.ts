import type { WebContentResult } from "@/integrations/tavily/web-content.provider";
import type { DetailInput } from "../dto/detail.input";

export function mapWebContentResultToDetails(
  result: WebContentResult
): DetailInput[] {
  const details: DetailInput[] = [];

  if (result.title) {
    details.push({
      key: `Website (${result.url}) Title`,
      value: [result.title],
    });
  }

  details.push({
    key: `Website (${result.url}) Scraped Summary`,
    value: [result.rawContent],
  });

  return details;
}
