import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";

@Injectable()
export class GithubService {
  private readonly octokit: Octokit;

  constructor() {
    if (!process.env.GITHUB_API_KEY) {
      throw new Error("GITHUB_API_KEY is not set in environment variables");
    }

    this.octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });
  }

  getRepositoryMeta(path: string) {
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

  async getRepositoryData(owner: string, repo: string) {
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
}
