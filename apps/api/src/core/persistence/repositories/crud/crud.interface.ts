import type { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import type { FindManyQuery, FindOneQuery } from "../../types/input.type";
import type { BatchCount, MultiPaged } from "../../types/output.type";
import type { PersistenceScope } from "../../types/scope.type";

export interface CrudMapperInterface<
  TEntity,
  TModel,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TEntity>,
  TFilter extends object = Partial<TEntity>,
  TSort extends object = Partial<TEntity>,
> {
  toDomain: (raw: TModel) => TEntity;
  toPersistenceForCreate: (entity: TCreate) => AnyKeys<TModel>;
  toPersistenceForFilter: (entity: Partial<TFilter>) => QueryFilter<TModel>;
  toPersistenceForSort: (
    entity: Partial<TSort>
  ) => Record<keyof TModel, SortOrder>;
  toPersistenceForUpdate: (entity: TUpdate) => UpdateQuery<TModel>;
}

export interface CrudRepositoryInterface<
  TModel,
  TEntity,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TEntity>,
  TFilter extends object = Partial<TEntity>,
  TSort extends object = Partial<TEntity>,
> {
  createMany: (createInputs: TCreate[]) => Promise<BatchCount>;
  createOne: (createInput: TCreate) => Promise<TEntity>;

  deleteMany: (filter: TFilter) => Promise<BatchCount>;
  deleteManyById: (ids: string[]) => Promise<BatchCount>;
  deleteOne: (query: FindOneQuery<TFilter>) => Promise<TEntity>;
  deleteOneById: (id: string) => Promise<TEntity>;

  findMany: (
    query: FindManyQuery<TFilter, TSort>
  ) => Promise<MultiPaged<TEntity>>;
  findManyById: (ids: string[]) => Promise<TEntity[]>;
  findOne: (query: FindOneQuery<TFilter>) => Promise<TEntity>;
  findOneById: (id: string) => Promise<TEntity>;

  global: () => CrudRepositoryInterface<
    TModel,
    TEntity,
    TCreate,
    TUpdate,
    TFilter,
    TSort
  >;
  scoped: (
    scope: PersistenceScope
  ) => CrudRepositoryInterface<
    TModel,
    TEntity,
    TCreate,
    TUpdate,
    TFilter,
    TSort
  >;

  updateMany: (
    filter: TFilter,
    updateInput: TUpdate,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ) => Promise<BatchCount>;
  updateManyById: (ids: string[], updateInput: TUpdate) => Promise<BatchCount>;
  updateOne: (
    query: FindOneQuery<TFilter>,
    updateInput: TUpdate
  ) => Promise<TEntity>;
  updateOneById: (id: string, updateInput: TUpdate) => Promise<TEntity>;
}
