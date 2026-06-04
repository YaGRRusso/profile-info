import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";
import { OpenRouter } from "@openrouter/sdk";
import { ChatRequest } from "@openrouter/sdk/models";
import pLimit from "p-limit";
import { AtsSummarizeInput, DetailInput } from "./dto/ats-summarize";
import { GenericIaEntity } from "./entities/ai.entity";
import { FreeAiModels } from "./enums/model.enum";
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

  // TODO IMPORTANT
  // Create a ResourceDetailOrchestrator service that will handle the orchestration of fetching resource details, including concurrency control and error handling.
  // This will keep the AiService focused on its core responsibilities and make the code more modular and maintainable.
  private async getResourceDetails(
    details: DetailInput[]
  ): Promise<DetailInput[]> {
    const promises: Promise<DetailInput[]>[] = [];
    const limit = pLimit(5);

    const urlKeys = ["urls", "links", "references", "resources"];

    const urlMatchingDetails = details.filter((detail) =>
      urlKeys.includes(detail.key.trim().toLocaleLowerCase())
    );

    for (const urlDetailMatch of urlMatchingDetails) {
      const ghUrls = urlDetailMatch.value.filter((url) =>
        url.includes("github.com")
      );

      for (const ghValue of ghUrls) {
        const { owner, repo } = this.getRepositoryMeta(ghValue);

        const fetchPromise = limit(() =>
          this.getRepositoryDetails(owner, repo)
        );

        promises.push(fetchPromise);
      }
    }

    if (promises.length === 0) return [];

    try {
      const timeoutDuration = 30_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutDuration)
      );

      const results = await Promise.race([
        Promise.all(promises),
        timeoutPromise,
      ]);

      return results.flat();
    } catch (error) {
      console.error(error);

      return [];
    }
  }

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<GenericIaEntity> {
    const parsedDetails = createDetails(details || []);

    if (details) {
      const resourceDetails = await this.getResourceDetails(details);
      parsedDetails.push(...createDetails(resourceDetails));
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

    console.dir(chatRequest, { depth: null });
    const completion = await this.client.chat.send({ chatRequest });
    console.dir(completion, { depth: null });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return openRouterMapper(completion);
  }
}
