import { Injectable } from "@nestjs/common";
import { AiProvider } from "@/integrations/ai/ai.provider";
import { DEFAULT_AI_MODEL } from "./constants/default-model";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
import { AiEntity } from "./entities/ai-response.entity";
import { createDetails } from "./helpers/detail";
import { mapChatResultToEntity } from "./mappers/chat-result.mapper";
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
import { ResourceDetailService } from "./resource-detail.service";

@Injectable()
export class AiToolsService {
  constructor(
    private readonly aiProvider: AiProvider,
    private readonly resourceDetailService: ResourceDetailService
  ) {}

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<AiEntity> {
    const parsedDetails = createDetails(details || []);

    if (details) {
      const resourceDetails =
        await this.resourceDetailService.getResourceDetails(details, type);
      parsedDetails.push(...createDetails(resourceDetails));
    }

    const result = await this.aiProvider.chat({
      model: DEFAULT_AI_MODEL,
      messages: [
        { role: "system", content: ATS_SUMMARIZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createAtsSummarizeContextPrompt({
            raw,
            skills,
            type,
            details: parsedDetails,
          }),
        },
      ],
    });

    return mapChatResultToEntity(result);
  }

  async summarize({ raw, type, details }: SummarizeInput): Promise<AiEntity> {
    const parsedDetails = createDetails(details || []);

    if (details) {
      const resourceDetails =
        await this.resourceDetailService.getResourceDetails(details, type);
      parsedDetails.push(...createDetails(resourceDetails));
    }

    const result = await this.aiProvider.chat({
      model: DEFAULT_AI_MODEL,
      messages: [
        { role: "system", content: SUMMARIZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createSummarizeContextPrompt({
            raw,
            type,
            details: parsedDetails,
          }),
        },
      ],
    });

    return mapChatResultToEntity(result);
  }

  async translate({
    raw,
    targetLanguage,
    sourceLanguage,
  }: TranslateInput): Promise<AiEntity> {
    const result = await this.aiProvider.chat({
      model: DEFAULT_AI_MODEL,
      messages: [
        { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createTranslateContextPrompt({
            raw,
            targetLanguage,
            sourceLanguage,
          }),
        },
      ],
    });

    return mapChatResultToEntity(result);
  }
}
