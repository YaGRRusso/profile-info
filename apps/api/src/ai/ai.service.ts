import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";
import { OpenRouter } from "@openrouter/sdk";
import { ChatRequest } from "@openrouter/sdk/models";
import { AtsSummarizeInput, DetailInput } from "./dto/ats-summarize";
import { GenericIaEntity } from "./entities/ai.entity";
import { FreeAiModels } from "./enums/model.enum";
import { ResourceType } from "./enums/resource-type";
import { OpenRouterRole } from "./enums/role.enum";
import { createDetails } from "./helpers/detail";
import { openRouterMapper } from "./mappers/open-routes";
import {
  ATS_SUMMARIZE_SYSTEM_PROMPT,
  createAtsSummarizeContextPrompt,
} from "./prompts/ats-summarize";

@Injectable()
export class AiService {
  private readonly client: OpenRouter;
  private readonly octokit: Octokit;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    if (!process.env.GITHUB_API_KEY) {
      throw new Error("GITHUB_API_KEY is not set in environment variables");
    }

    this.client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    this.octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });
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

  private async getProjectResourceDetails(
    details: DetailInput[]
  ): Promise<DetailInput[]> {
    const resourceDetails: DetailInput[] = [];
    const githubDetail = details.find(
      (detail) => detail.key.trim().toLocaleLowerCase() === "github"
    )?.value[0];

    if (githubDetail) {
      const { owner, repo } = this.getRepositoryMeta(githubDetail);
      const repositoryDetails = await this.getRepositoryDetails(owner, repo);
      resourceDetails.push(...repositoryDetails);
    }

    return resourceDetails;
  }

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<GenericIaEntity> {
    const parsedDetails = createDetails(details || []);

    if (details && type === ResourceType.PROJECT) {
      const projectResourceDetails =
        await this.getProjectResourceDetails(details);
      parsedDetails.push(...createDetails(projectResourceDetails));
    }

    const chatRequest: ChatRequest & { stream?: false } = {
      model: FreeAiModels.openrouter,
      messages: [
        {
          role: OpenRouterRole.SYSTEM,
          content: ATS_SUMMARIZE_SYSTEM_PROMPT,
        },
        {
          role: OpenRouterRole.USER,
          content: createAtsSummarizeContextPrompt({
            raw,
            skills,
            type,
            details: parsedDetails,
          }),
        },
      ],
    };

    console.log({ chatRequest });
    const completion = await this.client.chat.send({
      chatRequest,
    });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return openRouterMapper(completion);
  }
}
