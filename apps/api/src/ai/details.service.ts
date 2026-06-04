import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";
import { OrchestratorService } from "@/utils/orchestrator.service";
import { DetailInput } from "./dto/detail.input";

interface ExtractorConfig {
  accepts: (value: string) => boolean;
  extract: (value: string) => Promise<DetailInput[]>;
  supportedKeys: string[];
}

@Injectable()
export class ResourceDetailService {
  private readonly octokit: Octokit;
  private readonly extractors: ExtractorConfig[];

  constructor(private readonly orchestrator: OrchestratorService) {
    if (!process.env.GITHUB_API_KEY) {
      throw new Error("GITHUB_API_KEY is not set in environment variables");
    }

    this.octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });

    this.extractors = [
      {
        supportedKeys: ["urls", "links", "references", "resources"],
        accepts: (url) => url.includes("github.com"),
        extract: (url) => this.githubExtractor(url),
      },
    ];
  }

  async getResourceDetails(details: DetailInput[]): Promise<DetailInput[]> {
    const tasks: { value: string; extractor: ExtractorConfig }[] = [];

    for (const detail of details) {
      const key = detail.key.trim().toLocaleLowerCase();

      const matchedExtractors = this.extractors.filter((ext) =>
        ext.supportedKeys.includes(key)
      );

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
    try {
      const { owner, repo } = this.getRepositoryMeta(url);
      return await this.getRepositoryDetails(owner, repo);
    } catch (error) {
      console.error(`[GitHub Extractor] Process Error ${url}:`, error.message);
      return [];
    }
  }

  private getRepositoryMeta(path: string) {
    const url = new URL(path);

    if (url.hostname !== "github.com") {
      throw new Error("Should be a GitHub repository URL");
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new Error(
        "Invalid GitHub repository URL. Expected format: https://github.com/owner/repository"
      );
    }

    return {
      owner: parts[0],
      repo: parts[1],
    };
  }

  private async getRepositoryData(owner: string, repo: string) {
    const [repository, languages, readme, topics] = await Promise.all([
      this.octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
      this.octokit.request("GET /repos/{owner}/{repo}/languages", {
        owner,
        repo,
      }),
      this.octokit.request("GET /repos/{owner}/{repo}/readme", {
        owner,
        repo,
        headers: { accept: "application/vnd.github.raw" },
      }),
      this.octokit.request("GET /repos/{owner}/{repo}/topics", {
        owner,
        repo,
      }),
    ]);

    return {
      description: repository.data.description,
      languages: languages.data,
      readme: readme.data,
      topics: topics.data.names,
    };
  }

  private async getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<DetailInput[]> {
    const repositoryDetails: DetailInput[] = [];

    const { description, languages, readme, topics } =
      await this.getRepositoryData(owner, repo);

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
