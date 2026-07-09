import { registerEnumType } from "@nestjs/graphql";

export enum CredentialKind {
  SESSION = "session",
  API_TOKEN = "api_token",
}

registerEnumType(CredentialKind, {
  name: "CredentialKind",
});
