import { Injectable } from "@nestjs/common";
import { AiChatProvider } from "@/integrations/open-router/ai-chat.provider";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
import { AiEntity } from "./entities/ai-response.entity";
import {
  createAtsSummarizeLengthBudget,
  createAtsSummarizeTypeRules,
} from "./helpers/ats-context.helper";
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
import { ResourceDetailService } from "./resource-detail/resource-detail.service";

@Injectable()
export class AiToolsService {
  constructor(
    private readonly aiChatProvider: AiChatProvider,
    private readonly resourceDetailService: ResourceDetailService
  ) {}

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<AiEntity> {
    const extractedDetails = details
      ? await this.resourceDetailService.getResourceDetails(details, type)
      : [];

    const lengthBudget = createAtsSummarizeLengthBudget(type);
    const typeRules = createAtsSummarizeTypeRules(type);

    const result = await this.aiChatProvider.chat({
      messages: [
        { role: "system", content: ATS_SUMMARIZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createAtsSummarizeContextPrompt({
            raw,
            resourceContext: {
              type,
              skillsList: skills,
              maxLength: lengthBudget,
            },
            sectionFocus: typeRules,
            extraDetails: details ?? [],
            extractedDetails,
          }),
        },
      ],
    });

    return mapChatResultToEntity(result);
  }

  async summarize({ raw, type, details }: SummarizeInput): Promise<AiEntity> {
    const extractedDetails = details
      ? await this.resourceDetailService.getResourceDetails(details, type)
      : [];

    const result = await this.aiChatProvider.chat({
      messages: [
        { role: "system", content: SUMMARIZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createSummarizeContextPrompt({
            raw,
            resourceContext: { type },
            extraDetails: details ?? [],
            extractedDetails,
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
    const result = await this.aiChatProvider.chat({
      messages: [
        { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
        {
          role: "user",
          content: createTranslateContextPrompt({
            raw,
            resourceContext: { targetLanguage, sourceLanguage },
          }),
        },
      ],
    });

    return mapChatResultToEntity(result);
  }
}
