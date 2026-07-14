import { ApiTokenEntityRecord } from "./api-token.entity";

export type ApiTokenWithHashedEntity = ApiTokenEntityRecord & {
  hashedSecret: string;
};
