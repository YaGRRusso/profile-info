import { registerEnumType } from "@nestjs/graphql";

export enum ChatFinishReason {
  TOOL_CALLS = "tool_calls",
  STOP = "stop",
  LENGTH = "length",
  CONTENT_FILTER = "content_filter",
  ERROR = "error",
}

registerEnumType(ChatFinishReason, {
  name: "ChatFinishReason",
});
