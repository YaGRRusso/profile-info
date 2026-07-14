import { ChatResult } from "@openrouter/sdk/models";
import type { IntegrationChatResult } from "../ai-chat.provider";

export function openRouterResultMapper(
  result: ChatResult
): IntegrationChatResult {
  return {
    messages: result.choices.map((choice) => ({
      finishReason: choice.finishReason ?? null,
      message: {
        content: choice.message.content,
        reasoning: choice.message.reasoning,
        refusal: choice.message.refusal,
        role: choice.message.role,
      },
    })),
    usage: {
      completionTokens: result?.usage?.completionTokens,
      cost: result?.usage?.cost,
      promptTokens: result?.usage?.promptTokens,
      totalTokens: result?.usage?.totalTokens,
    },
  };
}
