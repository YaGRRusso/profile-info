import { ChatRequest } from "@openrouter/sdk/models";
import type { ChatCompletionRequest } from "../../ai.types";

export function mapToOpenRouterRequest(
  request: ChatCompletionRequest
): ChatRequest & { stream?: false } {
  return {
    model: request.model,
    messages: request.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })) as ChatRequest["messages"],
    stream: false,
  };
}
