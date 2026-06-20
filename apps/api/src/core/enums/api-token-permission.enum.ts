import { registerEnumType } from "@nestjs/graphql";

export enum ApiTokenPermission {
  QUERY = "QUERY",
  MUTATE = "MUTATE",
}

registerEnumType(ApiTokenPermission, {
  name: "ApiTokenPermission",
});
