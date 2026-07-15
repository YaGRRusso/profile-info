import { Injectable } from "@nestjs/common";
import { orchestrate } from "@/common/execution/orchestrator.helper";
import type { DetailInput } from "../dto/detail.input";
import type { ResourceType } from "../enums/resource-type";
import { WebpageResourceExtractorService } from "./extractors/webpage-resource-extractor.service";
import type { ResourceExtractor } from "./resource-extractor.interface";

@Injectable()
export class ResourceDetailService {
  private readonly extractors: ResourceExtractor[];

  constructor(
    webpageResourceExtractorService: WebpageResourceExtractorService
  ) {
    this.extractors = [webpageResourceExtractorService];
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
        if (!matchedKey) return false;
        if (!type || !extractor.supportedTypes) return true;

        return extractor.supportedTypes.includes(type);
      });

      if (matchedExtractors.length === 0) continue;

      for (const value of detail.value) {
        for (const extractor of matchedExtractors) {
          if (extractor.accepts(value)) {
            tasks.push({ extractor, value });
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
