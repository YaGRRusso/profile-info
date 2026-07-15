export interface WebSearchOptions {
  maxResults?: number;
}

export interface WebSearchResult {
  content: string;
  score?: number;
  title: string;
  url: string;
}

export abstract class WebSearchProvider {
  abstract search(
    query: string,
    options?: WebSearchOptions
  ): Promise<WebSearchResult[]>;
}
