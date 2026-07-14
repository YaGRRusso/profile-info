import type { QueryFilter, SortOrder } from "mongoose";
import type { CrudMapperInterface } from "../crud/crud.interface";

export function createPassThroughMapper<TModel>(): CrudMapperInterface<
  TModel,
  TModel
> {
  return {
    toDomain: (doc) => doc,
    toPersistenceForCreate: (entity) => entity,
    toPersistenceForFilter: (entity) => entity as QueryFilter<TModel>,
    toPersistenceForSort: (entity) => entity as Record<keyof TModel, SortOrder>,
    toPersistenceForUpdate: (entity) => entity,
  };
}
