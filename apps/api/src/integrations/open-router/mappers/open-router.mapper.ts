import { ChatResult } from "@openrouter/sdk/models";
import type { IntegrationChatResult } from "../ai-chat.provider";

export function mapFromOpenRouterResponse(
  result: ChatResult
): IntegrationChatResult {
  return {
    messages: result.choices.map((choice) => ({
      finishReason: choice.finishReason ?? null,
      message: {
        role: choice.message.role,
        content: choice.message.content,
        reasoning: choice.message.reasoning,
        refusal: choice.message.refusal,
      },
    })),
    usage: {
      completionTokens: result?.usage?.completionTokens,
      promptTokens: result?.usage?.promptTokens,
      totalTokens: result?.usage?.totalTokens,
      cost: result?.usage?.cost,
    },
  };
}
