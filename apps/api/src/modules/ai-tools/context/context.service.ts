import { Injectable } from "@nestjs/common";
import { uniqBy } from "lodash";
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

  enrichFromDetails(
    details: DetailInput[],
    type: ResourceType
  ): Promise<DetailInput[]> {
    const tasks = uniqBy(
      details.flatMap((detail): ContextTask[] => {
        const { contextMode: mode } = detail;
        if (!mode) return [];

        return detail.value
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => ({ mode, value }));
      }),
      (task) => `${task.mode}:${task.value}`
    );

    if (tasks.length === 0) return Promise.resolve([]);

    return this.runParallelTasks(tasks, type);
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

    const results = await this.webSearchProvider.search(
      [query.trim(), type].filter(Boolean).join(" ")
    );
    return results.flatMap(mapWebSearchResultToDetails);
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
