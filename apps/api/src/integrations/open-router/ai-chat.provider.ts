export interface IntegrationChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
}

export interface IntegrationChatMessage {
  content: string;
  reasoning?: string | null;
  refusal?: string | null;
  role: string;
}

export interface IntegrationChatChoice {
  finishReason: string | null;
  message: IntegrationChatMessage;
}

export interface IntegrationChatUsage {
  completionTokens?: number | null;
  cost?: number | null;
  promptTokens?: number | null;
  totalTokens?: number | null;
}

export interface IntegrationChatResult {
  messages: IntegrationChatChoice[];
  usage: IntegrationChatUsage;
}

export abstract class AiChatProvider {
  abstract chat(
    request: IntegrationChatRequest
  ): Promise<IntegrationChatResult>;
}
