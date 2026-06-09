export interface WebContentExtractOptions {
  instructions?: string;
}

export interface WebContentResult {
  rawContent: string;
  title?: string;
  url: string;
}

export abstract class WebContentProvider {
  abstract extract(
    urls: string[],
    options?: WebContentExtractOptions
  ): Promise<WebContentResult[]>;
}
