export type ChatRole = "assistant" | "developer" | "system" | "tool" | "user";

export type ChatFinishReason =
  | "tool_calls"
  | "stop"
  | "length"
  | "content_filter"
  | "error";

export interface ChatMessage {
  content: string;
  reasoning?: string | null;
  refusal?: string | null;
  role: ChatRole;
}

export interface ChatChoice {
  finishReason: ChatFinishReason | null;
  message: ChatMessage;
}

export interface ChatUsage {
  completionTokens?: number | null;
  cost?: number | null;
  promptTokens?: number | null;
  totalTokens?: number | null;
}

export interface ChatCompletionRequest {
  messages: Array<{ role: ChatRole; content: string }>;
  model: string;
}

export interface ChatCompletionResult {
  messages: ChatChoice[];
  usage: ChatUsage;
}
