import { Injectable } from "@nestjs/common";
import { compact, groupBy, uniqBy, words } from "lodash";
import { orchestrate } from "@/common/execution/orchestrator.helper";
import { isWebpageUrl } from "@/common/helpers/url.helper";
import { WebContentProvider } from "@/integrations/tavily/web-content.provider";
import { WebSearchProvider } from "@/integrations/tavily/web-search.provider";
import type { DetailInput } from "../dto/detail.input";
import { ContextMode } from "../enums/context-mode";
import { ResourceType } from "../enums/resource-type";
import { mapWebContentResultToDetails } from "../mappers/web-content-result.mapper";
import { mapWebSearchResultToDetails } from "../mappers/web-search-result.mapper";

const PAGE_EXTRACT_INSTRUCTIONS =
  "Identify the main objective of this page and its target audience, extract the key information and main topics. Write a summary of the information presented on the page. Ignore forms and loading issues, focus on the real content.";

const CONTEXT_FALLBACK_ORDER = [
  ContextMode.PAGE_EXTRACT,
  ContextMode.WEB_SEARCH,
] as const;

interface ContextTask {
  mode: ContextMode;
  value: string;
}

@Injectable()
export class ContextService {
  constructor(
    private readonly webContentProvider: WebContentProvider,
    private readonly webSearchProvider: WebSearchProvider
  ) {}

  async enrichFromDetails(
    details: DetailInput[],
    type: ResourceType
  ): Promise<DetailInput[]> {
    const tasksByMode = groupBy(this.collectTasks(details), "mode");

    for (const mode of CONTEXT_FALLBACK_ORDER) {
      const modeTasks = tasksByMode[mode] ?? [];
      if (modeTasks.length === 0) continue;

      // biome-ignore lint/performance/noAwaitInLoops: fallback chain must not run later modes in parallel
      const results = await this.runParallelTasks(modeTasks, type);
      if (results.length > 0) return results;
    }

    return [];
  }

  async enrichPageExtract(url: string): Promise<DetailInput[]> {
    if (!isWebpageUrl(url)) return [];

    const results = await this.webContentProvider.extract([url], {
      instructions: PAGE_EXTRACT_INSTRUCTIONS,
    });

    return results.flatMap(mapWebContentResultToDetails);
  }

  async enrichWebSearch(
    query: string,
    type?: ResourceType
  ): Promise<DetailInput[]> {
    if (!query.trim()) return [];

    const searchQuery = compact([query.trim(), type]).join(" ");
    const results = await this.webSearchProvider.search(searchQuery, {
      maxResults: this.maxResultsForQuery(searchQuery),
    });
    return results.flatMap(mapWebSearchResultToDetails);
  }

  private collectTasks(details: DetailInput[]): ContextTask[] {
    return uniqBy(
      details.flatMap((detail): ContextTask[] => {
        const { contextMode: mode } = detail;
        if (!mode) return [];

        return compact(detail.value.map((value) => value.trim())).map(
          (value) => ({ mode, value })
        );
      }),
      (task) => `${task.mode}:${task.value}`
    );
  }

  private maxResultsForQuery(query: string): number {
    const count = words(query).length;
    if (count >= 5) return 1;
    if (count >= 4) return 2;
    if (count >= 3) return 3;
    if (count >= 2) return 4;
    if (count >= 1) return 5;
    return 5;
  }

  private runSingleTask(
    task: ContextTask,
    type: ResourceType
  ): Promise<DetailInput[]> {
    switch (task.mode) {
      case ContextMode.PAGE_EXTRACT:
        return this.enrichPageExtract(task.value);
      case ContextMode.WEB_SEARCH:
        return this.enrichWebSearch(task.value, type);
      default:
        return Promise.resolve([]);
    }
  }

  private runParallelTasks(
    tasks: ContextTask[],
    type: ResourceType
  ): Promise<DetailInput[]> {
    return orchestrate(tasks, (task) => this.runSingleTask(task, type), {
      concurrency: 5,
      timeoutMs: 30_000,
    });
  }
}
