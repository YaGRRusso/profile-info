import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import {
  toBaseEntityFields,
  toIdString,
  toObjectId,
} from "@/core/mappers/base.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateApiTokenInput } from "../dto/create-api-token.input";
import { FilterApiTokenInput } from "../dto/filter-api-token.input";
import { SortApiTokenInput } from "../dto/sort-api-token.input";
import { UpdateApiTokenInput } from "../dto/update-api-token.input";
import type { ApiTokenEntity } from "../entities/api-token.entity";
import type { ApiTokenModel } from "../schemas/api-token.schema";

export type ApiTokenCreateRecord = CreateApiTokenInput & {
  id: string;
  hashedSecret: string;
};

export class ApiTokenMapper
  implements
    CrudMapperInterface<
      ApiTokenEntity,
      ApiTokenModel,
      ApiTokenCreateRecord,
      UpdateApiTokenInput,
      FilterApiTokenInput,
      SortApiTokenInput
    >
{
  toDomain(model: ApiTokenModel): ApiTokenEntity {
    return {
      ...toBaseEntityFields(model),
      ownerId: toIdString(model.ownerId) ?? "",
      name: model.name,
      permissions: model.permissions,
      expiresAt: model.expiresAt,
    };
  }

  toPersistenceForCreate(entity: ApiTokenCreateRecord): AnyKeys<ApiTokenModel> {
    return {
      _id: toObjectId(entity.id),
      name: entity.name,
      hashedSecret: entity.hashedSecret,
      permissions: entity.permissions,
      expiresAt: entity.expiresAt,
    };
  }

  toPersistenceForUpdate(
    entity: UpdateApiTokenInput
  ): UpdateQuery<ApiTokenModel> {
    return { ...entity };
  }

  toPersistenceForFilter(
    entity: FilterApiTokenInput
  ): QueryFilter<ApiTokenModel> {
    return withObjectIdRefs(entity, {});
  }

  toPersistenceForSort(
    entity: SortApiTokenInput
  ): Record<keyof ApiTokenModel, SortOrder> {
    return { ...entity } as Record<keyof ApiTokenModel, SortOrder>;
  }
}
