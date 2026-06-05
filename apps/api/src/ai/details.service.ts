import { Injectable } from "@nestjs/common";
import { GithubService } from "@/utils/github.service";
import { OrchestratorService } from "@/utils/orchestrator.service";
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

  constructor(orchestrator: OrchestratorService, githubService: GithubService) {
    this.orchestrator = orchestrator;
    this.githubService = githubService;

    this.extractors = [
      {
        supportedTypes: [ResourceType.PROJECT],
        supportedKeys: ["urls", "links", "references", "resources"],
        accepts: (url) => url.includes("github.com"),
        extract: (url) => this.githubExtractor(url),
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

    return await this.orchestrator.execute(
      tasks,
      (task) => task.extractor.extract(task.value),
      { concurrency: 5, timeoutMs: 30_000 }
    );
  }

  private async githubExtractor(url: string): Promise<DetailInput[]> {
    const repositoryDetails: DetailInput[] = [];

    const { owner, repo } = this.githubService.getRepositoryMeta(url);

    const { description, languages, readme, topics } =
      await this.githubService.getRepositoryData(owner, repo);

    repositoryDetails.push({
      key: "languages",
      value: Object.keys(languages),
    });

    if (description) {
      repositoryDetails.push({
        key: "description",
        value: [description],
      });
    }

    if (topics.length > 0) {
      repositoryDetails.push({
        key: "topics",
        value: topics,
      });
    }

    if (readme && typeof readme === "string") {
      repositoryDetails.push({
        key: "readme",
        value: [readme],
      });
    }

    return repositoryDetails;
  }
}
