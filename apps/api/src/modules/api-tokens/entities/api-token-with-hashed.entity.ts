import { ApiTokenEntity } from "./api-token.entity";

export type ApiTokenWithHashedEntity = ApiTokenEntity & {
  hashedSecret: string;
};
