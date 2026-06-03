import { registerEnumType } from "@nestjs/graphql";

export enum OpenRouterRole {
  ASSISTANT = "assistant",
  DEVELOPER = "developer",
  SYSTEM = "system",
  TOOL = "tool",
  USER = "user",
}

registerEnumType(OpenRouterRole, {
  name: "OpenRouterRole",
});
