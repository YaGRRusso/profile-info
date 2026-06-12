import { ChatRequest } from "@openrouter/sdk/models";
import type { IntegrationChatRequest } from "../ai-chat.provider";

export function openRouterRequestMapper(
  request: IntegrationChatRequest,
  model: string
): ChatRequest & { stream?: false } {
  return {
    model,
    messages: request.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })) as ChatRequest["messages"],
    stream: false,
  };
}
