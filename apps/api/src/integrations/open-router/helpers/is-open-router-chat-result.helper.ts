import type { ChatResult } from "@openrouter/sdk/models";

export function isOpenRouterChatResult(value: unknown): value is ChatResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "choices" in value &&
    Array.isArray((value as ChatResult).choices)
  );
}
