import { ChatRequest } from "@openrouter/sdk/models";
import type { IntegrationChatRequest } from "../ai-chat.provider";

export function openRouterRequestMapper(
  request: IntegrationChatRequest,
  model: string
): ChatRequest & { stream?: false } {
  return {
    messages: request.messages.map((message) => ({
      content: message.content,
      role: message.role,
    })) as ChatRequest["messages"],
    model,
    stream: false,
  };
}
