import type { ChatContentItems, ChatResult } from "@openrouter/sdk/models";
import { isNil } from "lodash";
import type { IntegrationChatResult } from "../ai-chat.provider";

function toIntegrationContent(
  content: string | ChatContentItems[] | null | undefined
): string {
  if (isNil(content)) return "";
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((item) =>
        item.type === "text" && "text" in item ? String(item.text) : ""
      )
      .join("");
  }

  return "";
}

export function openRouterResultMapper(
  result: ChatResult
): IntegrationChatResult {
  return {
    messages: result.choices.map((choice) => ({
      finishReason: choice.finishReason ?? null,
      message: {
        content: toIntegrationContent(choice.message.content),
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
