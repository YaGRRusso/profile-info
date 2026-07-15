import { Injectable } from "@nestjs/common";
import { ChatService } from "./chat/chat.service";
import { ContextService } from "./context/context.service";
import { AtsSummarizeInput } from "./dto/ats-summarize.input";
import { SummarizeInput } from "./dto/summarize.input";
import { TranslateInput } from "./dto/translate.input";
import { AiEntity } from "./entities/ai-response.entity";
import {
  createAtsSummarizeLengthBudget,
  createAtsSummarizeTypeRules,
} from "./helpers/ats-context.helper";
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
export class AiToolsService {
  constructor(
    private readonly chatService: ChatService,
    private readonly contextService: ContextService
  ) {}

  async atsSummarize({
    raw,
    skills,
    type,
    details,
  }: AtsSummarizeInput): Promise<AiEntity> {
    const extractedDetails = details
      ? await this.contextService.enrichFromDetails(details, type)
      : [];

    const lengthBudget = createAtsSummarizeLengthBudget(type);
    const typeRules = createAtsSummarizeTypeRules(type);

    return this.chatService.chat({
      messages: [
        { content: ATS_SUMMARIZE_SYSTEM_PROMPT, role: "system" },
        {
          content: createAtsSummarizeContextPrompt({
            extractedDetails,
            extraDetails: details ?? [],
            raw,
            resourceContext: {
              maxLength: lengthBudget,
              skillsList: skills,
              type,
            },
            sectionFocus: typeRules,
          }),
          role: "user",
        },
      ],
    });
  }

  async summarize({ raw, type, details }: SummarizeInput): Promise<AiEntity> {
    const extractedDetails = details
      ? await this.contextService.enrichFromDetails(details, type)
      : [];

    return this.chatService.chat({
      messages: [
        { content: SUMMARIZE_SYSTEM_PROMPT, role: "system" },
        {
          content: createSummarizeContextPrompt({
            extractedDetails,
            extraDetails: details ?? [],
            raw,
            resourceContext: { type },
          }),
          role: "user",
        },
      ],
    });
  }

  translate({
    raw,
    targetLanguage,
    sourceLanguage,
  }: TranslateInput): Promise<AiEntity> {
    return this.chatService.chat({
      messages: [
        { content: TRANSLATE_SYSTEM_PROMPT, role: "system" },
        {
          content: createTranslateContextPrompt({
            raw,
            resourceContext: { sourceLanguage, targetLanguage },
          }),
          role: "user",
        },
      ],
    });
  }
}
