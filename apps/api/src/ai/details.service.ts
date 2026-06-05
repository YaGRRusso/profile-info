import { Injectable } from "@nestjs/common";
import { GithubService } from "@/utils/github.service";
import { OrchestratorService } from "@/utils/orchestrator.service";
import { WebSearchService } from "@/utils/web-search.service";
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
  private readonly orchestrator: OrchestratorService;
  private readonly githubService: GithubService;
  private readonly webSearchService: WebSearchService;

  constructor(
    orchestrator: OrchestratorService,
    githubService: GithubService,
    webSearchService: WebSearchService
  ) {
    this.orchestrator = orchestrator;
    this.githubService = githubService;
    this.webSearchService = webSearchService;

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
        accepts: () => true, // accept all URLs for organization websites
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

    const results = await this.orchestrator.execute(
      tasks,
      (task) => task.extractor.extract(task.value),
      { concurrency: 5, timeoutMs: 30_000 }
    );

    return results;
  }

  private async webSearchExtractor(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const { results } = await this.webSearchService.extract([url], {
      instructions:
        "Identify the main objective of this page and its target audience, extract the key information and main topics. Write a summary of the information presented on the page. Ignore forms and loading issues, focus on the real content.",
    });

    if (results && results.length > 0) {
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
    }

    return extraDetails;
  }

  private async githubExtractor(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const { owner, repo } = this.githubService.getRepositoryMeta(url);

    const { description, languages, readme, topics } =
      await this.githubService.getRepositoryData(owner, repo);

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
