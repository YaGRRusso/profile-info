import { toBaseEntityFields, toIdString } from "@/core/mappers/base.mapper";
import type { ApiTokenEntity } from "../entities/api-token.entity";
import type { ApiTokenModel } from "../schemas/api-token.schema";

export function toApiTokenEntity(model: ApiTokenModel): ApiTokenEntity {
  return {
    ...toBaseEntityFields(model),
    ownerId: toIdString(model.ownerId) ?? "",
    name: model.name,
    permissions: model.permissions,
    expiresAt: model.expiresAt,
  };
}
