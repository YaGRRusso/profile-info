import { Injectable } from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import { AtsSummarizeInput } from "./dto/ats-summarize";
import { GenericIaEntity } from "./entities/ai.entity";
import { FreeAiModels } from "./enums/model.enum";
import { OpenRouterRole } from "./enums/role.enum";
import { openRouterMapper } from "./mappers/open-routes";
import {
  ATS_SUMMARIZE_SYSTEM_PROMPT,
  createAtsSummarizeContextPrompt,
} from "./prompts/ats-summarize";

@Injectable()
export class AiService {
  private readonly client: OpenRouter;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    this.client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  }

  // private async getRepositoryData({
  //   owner,
  //   repo,
  // }: {
  //   owner: string;
  //   repo: string;
  // }) {
  //   const [repository, languages, readme, topics] = await Promise.all([
  //     this.octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
  //     this.octokit.request("GET /repos/{owner}/{repo}/languages", {
  //       owner,
  //       repo,
  //     }),
  //     this.octokit.request("GET /repos/{owner}/{repo}/readme", {
  //       owner,
  //       repo,
  //       headers: { accept: "application/vnd.github.raw" },
  //     }),
  //     await this.octokit.request("GET /repos/{owner}/{repo}/topics", {
  //       owner,
  //       repo,
  //     }),
  //   ]);

  //   return {
  //     description: repository.data.description,
  //     languages: languages.data,
  //     readme: readme.data,
  //     topics: topics.data.names,
  //   };
  // }

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<GenericIaEntity> {
    const completion = await this.client.chat.send({
      chatRequest: {
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
              details,
            }),
          },
        ],
      },
    });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return openRouterMapper(completion);
  }
}
