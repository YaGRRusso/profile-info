import { Injectable } from "@nestjs/common";
import { orchestrate } from "@/common/execution/orchestrator.helper";
import type { DetailInput } from "../dto/detail.input";
import type { ResourceType } from "../enums/resource-type";
import { GithubResourceExtractorService } from "./extractors/github-resource-extractor.service";
import { WebSearchResourceExtractorService } from "./extractors/web-search-resource-extractor.service";
import type { ResourceExtractor } from "./resource-extractor.interface";

@Injectable()
export class ResourceDetailService {
  private readonly extractors: ResourceExtractor[];

  constructor(
    githubResourceExtractorService: GithubResourceExtractorService,
    webSearchResourceExtractorService: WebSearchResourceExtractorService
  ) {
    this.extractors = [
      githubResourceExtractorService,
      webSearchResourceExtractorService,
    ];
  }

  async getResourceDetails(
    details: DetailInput[],
    type?: ResourceType
  ): Promise<DetailInput[]> {
    const tasks: { value: string; extractor: ResourceExtractor }[] = [];

    for (const detail of details) {
      const key = detail.key.trim().toLocaleLowerCase();

      const matchedExtractors = this.extractors.filter((extractor) => {
        const matchedKey = extractor.supportedKeys.includes(key);
        if (!type) return matchedKey;

        const matchedType = extractor.supportedTypes?.includes(type);
        return matchedKey && matchedType;
      });

      if (matchedExtractors.length === 0) continue;

      for (const value of detail.value) {
        for (const extractor of matchedExtractors) {
          if (extractor.accepts(value)) {
            tasks.push({ value, extractor });
          }
        }
      }
    }

    const results = await orchestrate(
      tasks,
      (task) => task.extractor.extract(task.value),
      { concurrency: 5, timeoutMs: 30_000 }
    );

    return results;
  }
}
