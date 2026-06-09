import { registerEnumType } from "@nestjs/graphql";

export enum ChatRole {
  ASSISTANT = "assistant",
  DEVELOPER = "developer",
  SYSTEM = "system",
  TOOL = "tool",
  USER = "user",
}

registerEnumType(ChatRole, {
  name: "ChatRole",
});
