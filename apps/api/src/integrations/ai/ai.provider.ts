import type { ChatCompletionRequest, ChatCompletionResult } from "./ai.types";

export abstract class AiProvider {
  abstract chat(request: ChatCompletionRequest): Promise<ChatCompletionResult>;
}
