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
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateApiTokenInput } from "../dto/create-api-token.input";
import { FilterApiTokenInput } from "../dto/filter-api-token.input";
import { SortApiTokenInput } from "../dto/sort-api-token.input";
import { UpdateApiTokenInput } from "../dto/update-api-token.input";
import type { ApiTokenEntityRecord } from "../entities/api-token.entity";
import type { ApiTokenModel } from "../schemas/api-token.schema";

export type ApiTokenCreateRecord = CreateApiTokenInput & {
  id: string;
  hashedSecret: string;
};

export class ApiTokenMapper
  implements
    CrudMapperInterface<
      ApiTokenEntityRecord,
      ApiTokenModel,
      ApiTokenCreateRecord,
      UpdateApiTokenInput,
      FilterApiTokenInput,
      SortApiTokenInput
    >
{
  toDomain(model: ApiTokenModel): ApiTokenEntityRecord {
    return {
      ...toBaseEntityFields(model),
      expiresAt: model.expiresAt,
      name: model.name,
      ownerId: toIdString(model.ownerId) ?? "",
      permissions: model.permissions,
    };
  }

  toPersistenceForCreate(entity: ApiTokenCreateRecord): AnyKeys<ApiTokenModel> {
    return {
      _id: toObjectId(entity.id),
      expiresAt: entity.expiresAt,
      hashedSecret: entity.hashedSecret,
      name: entity.name,
      permissions: entity.permissions,
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
    return toPersistenceSort<SortApiTokenInput, ApiTokenModel>(entity);
  }
}
