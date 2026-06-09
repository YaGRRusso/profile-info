import { Injectable } from "@nestjs/common";
import { orchestrate } from "@/common/execution/orchestrator.helper";
import { RepositoryMetadataProvider } from "@/integrations/github/repository-metadata.provider";
import { WebContentProvider } from "@/integrations/tavily/web-content.provider";
import { DetailInput } from "./dto/detail.input";
import { ResourceType } from "./enums/resource-type";

interface ExtractorConfig {
  accepts: (value: string) => boolean;
  extract: (value: string) => Promise<DetailInput[]>;
  supportedKeys: string[];
  supportedTypes?: ResourceType[];
}

@Injectable()
export class ResourceDetailService {
  private readonly extractors: ExtractorConfig[];

  constructor(
    private readonly repositoryMetadataProvider: RepositoryMetadataProvider,
    private readonly webContentProvider: WebContentProvider
  ) {
    this.extractors = [
      {
        supportedTypes: [ResourceType.PROJECT],
        supportedKeys: ["urls", "links", "references", "resources"],
        accepts: (url) => url.includes("github.com"),
        extract: (url) => this.githubExtractor(url),
      },
      {
        supportedTypes: [ResourceType.ORGANIZATION],
        supportedKeys: ["website", "url", "link"],
        accepts: () => true,
        extract: (url) => this.webSearchExtractor(url),
      },
    ];
  }

  async getResourceDetails(
    details: DetailInput[],
    type?: ResourceType
  ): Promise<DetailInput[]> {
    const tasks: { value: string; extractor: ExtractorConfig }[] = [];

    for (const detail of details) {
      const key = detail.key.trim().toLocaleLowerCase();

      const matchedExtractors = this.extractors.filter((ext) => {
        const matchedKey = ext.supportedKeys.includes(key);
        if (!type) return matchedKey;

        const matchedType = ext.supportedTypes?.includes(type);
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

  private async webSearchExtractor(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const results = await this.webContentProvider.extract([url], {
      instructions:
        "Identify the main objective of this page and its target audience, extract the key information and main topics. Write a summary of the information presented on the page. Ignore forms and loading issues, focus on the real content.",
    });

    for (const result of results) {
      if (result.title) {
        extraDetails.push({
          key: `Website (${result.url}) Title`,
          value: [result.title],
        });
      }
      extraDetails.push({
        key: `Website (${result.url}) Scraped Summary`,
        value: [result.rawContent],
      });
    }

    return extraDetails;
  }

  private async githubExtractor(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const { owner, repo } =
      this.repositoryMetadataProvider.getRepositoryMeta(url);

    const { description, languages, readme, topics } =
      await this.repositoryMetadataProvider.getRepositoryData(owner, repo);

    extraDetails.push({
      key: "languages",
      value: Object.keys(languages),
    });

    if (description) {
      extraDetails.push({
        key: "description",
        value: [description],
      });
    }

    if (topics.length > 0) {
      extraDetails.push({
        key: "topics",
        value: topics,
      });
    }

    if (readme && typeof readme === "string") {
      extraDetails.push({
        key: "readme",
        value: [readme],
      });
    }

    return extraDetails;
  }
}
