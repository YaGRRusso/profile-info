import type { ChatCompletionResult } from "@/integrations/ai/ai.types";
import { AiEntity } from "../entities/ai-response.entity";
import { OpenRouterRole } from "../enums/chat-role.enum";
import { ChatFinishReason } from "../enums/finish-reason.enum";

export function mapChatResultToEntity(result: ChatCompletionResult): AiEntity {
  return {
    messages: result.messages.map((choice) => ({
      finishReason: choice.finishReason as ChatFinishReason,
      message: {
        role: choice.message.role as OpenRouterRole,
        content: choice.message.content,
        reasoning: choice.message.reasoning,
        refusal: choice.message.refusal,
      },
    })),
    usage: result.usage,
  };
}
