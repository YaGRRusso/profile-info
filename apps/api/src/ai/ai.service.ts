import { Injectable } from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import { ChatRequest } from "@openrouter/sdk/models";
import { ResourceDetailService } from "./details.service";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
import { GenericIaEntity } from "./entities/ai.entity";
import { FreeAiModels } from "./enums/model.enum";
import { OpenRouterRole } from "./enums/role.enum";
import { createDetails } from "./helpers/detail";
import { openRouterMapper } from "./mappers/open-routes";
import {
  ATS_SUMMARIZE_SYSTEM_PROMPT,
  createAtsSummarizeContextPrompt,
} from "./prompts/ats-summarize.prompt";
import {
  createSummarizeContextPrompt,
  SUMMARIZE_SYSTEM_PROMPT,
} from "./prompts/summarize.prompt";
import {
  createTranslateContextPrompt,
  TRANSLATE_SYSTEM_PROMPT,
} from "./prompts/translate.prompt";

@Injectable()
export class AiService {
  private readonly client: OpenRouter;
  private readonly resourceDetailService: ResourceDetailService;

  constructor(resourceDetailService: ResourceDetailService) {
    this.resourceDetailService = resourceDetailService;

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
    const parsedDetails = createDetails(details || []);

    if (details) {
      const resourceDetails =
        await this.resourceDetailService.getResourceDetails(details, type);
      parsedDetails.push(...createDetails(resourceDetails));
    }

    const chatRequest: ChatRequest & { stream?: false } = {
      model: FreeAiModels.google,
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

    return await this.executeChatRequest(chatRequest);
  }

  async summarize({
    raw,
    type,
    details,
  }: SummarizeInput): Promise<GenericIaEntity> {
    const parsedDetails = createDetails(details || []);

    if (details) {
      const resourceDetails =
        await this.resourceDetailService.getResourceDetails(details, type);
      parsedDetails.push(...createDetails(resourceDetails));
    }

    const chatRequest: ChatRequest & { stream?: false } = {
      model: FreeAiModels.google,
      messages: [
        {
          role: OpenRouterRole.SYSTEM,
          content: SUMMARIZE_SYSTEM_PROMPT,
        },
        {
          role: OpenRouterRole.USER,
          content: createSummarizeContextPrompt({
            raw,
            type,
            details: parsedDetails,
          }),
        },
      ],
    };

    return await this.executeChatRequest(chatRequest);
  }

  async translate({
    raw,
    targetLanguage,
    sourceLanguage,
  }: TranslateInput): Promise<GenericIaEntity> {
    const chatRequest: ChatRequest & { stream?: false } = {
      model: FreeAiModels.google,
      messages: [
        {
          role: OpenRouterRole.SYSTEM,
          content: TRANSLATE_SYSTEM_PROMPT,
        },
        {
          role: OpenRouterRole.USER,
          content: createTranslateContextPrompt({
            raw,
            targetLanguage,
            sourceLanguage,
          }),
        },
      ],
    };

    return await this.executeChatRequest(chatRequest);
  }

  private async executeChatRequest(
    chatRequest: ChatRequest & { stream?: false }
  ): Promise<GenericIaEntity> {
    console.dir(chatRequest, { depth: null });
    const completion = await this.client.chat.send({ chatRequest });
    console.dir(completion, { depth: null });

    if (!completion) throw new Error("No completion received from OpenRouter");
    return openRouterMapper(completion);
  }
}
