import { Injectable } from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import { AtsSummarizeInput } from "./dto/ats-summarize";
import { GenericIaEntity } from "./entities/ai.entity";
import { FreeModelsEnum } from "./enums/model.enum";
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

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<GenericIaEntity> {
    const completion = await this.client.chat.send({
      chatRequest: {
        model: FreeModelsEnum.openrouter,
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
