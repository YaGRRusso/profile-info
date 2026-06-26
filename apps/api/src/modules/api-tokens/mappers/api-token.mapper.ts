import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields, toIdString } from "@/core/mappers/base.mapper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateApiTokenInput } from "../dto/create-api-token.input";
import { FilterApiTokenInput } from "../dto/filter-api-token.input";
import { SortApiTokenInput } from "../dto/sort-api-token.input";
import { UpdateApiTokenInput } from "../dto/update-api-token.input";
import type { ApiTokenEntity } from "../entities/api-token.entity";
import type { ApiTokenModel } from "../schemas/api-token.schema";

type ApiTokenCreateRecord = CreateApiTokenInput & {
  id: string;
  hashedSecret: string;
};

export class ApiTokenMapper
  implements CrudMapperInterface<ApiTokenEntity, ApiTokenModel>
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

  toPersistenceForCreate(entity: CreateApiTokenInput): AnyKeys<ApiTokenModel> {
    const input = entity as ApiTokenCreateRecord;

    return {
      _id: input.id,
      name: input.name,
      hashedSecret: input.hashedSecret,
      permissions: input.permissions,
      expiresAt: input.expiresAt,
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
    return { ...entity } as QueryFilter<ApiTokenModel>;
  }

  toPersistenceForSort(
    entity: SortApiTokenInput
  ): Record<keyof ApiTokenModel, SortOrder> {
    return { ...entity } as Record<keyof ApiTokenModel, SortOrder>;
  }
}
