import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Octokit } from "@octokit/rest";
import type { Env } from "@/core/configs/env.validation";
import {
  type RepositoryData,
  RepositoryMetadataProvider,
  type RepositoryOwnerRepo,
} from "./repository-metadata.provider";

@Injectable()
export class GithubService extends RepositoryMetadataProvider {
  private readonly octokit: Octokit;

  constructor(config: ConfigService<Env, true>) {
    super();

    this.octokit = new Octokit({
      auth: config.getOrThrow("GITHUB_API_KEY"),
    });
  }

  getRepositoryMeta(path: string): RepositoryOwnerRepo {
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

  async getRepositoryData(
    owner: string,
    repo: string
  ): Promise<RepositoryData> {
    const [repository, languages, readme, topics] = await Promise.all([
      this.octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
      this.octokit.request("GET /repos/{owner}/{repo}/languages", {
        owner,
        repo,
      }),
      this.octokit.request("GET /repos/{owner}/{repo}/readme", {
        headers: { accept: "application/vnd.github.raw" },
        owner,
        repo,
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
}
