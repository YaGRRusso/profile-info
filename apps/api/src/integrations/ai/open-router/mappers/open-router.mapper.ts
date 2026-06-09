import { ChatResult } from "@openrouter/sdk/models";
import type {
  ChatCompletionResult,
  ChatFinishReason,
  ChatRole,
} from "../../ai.types";

export function mapFromOpenRouterResponse(
  result: ChatResult
): ChatCompletionResult {
  return {
    messages: result.choices.map((choice) => ({
      finishReason: choice.finishReason as ChatFinishReason,
      message: {
        role: choice.message.role as ChatRole,
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
