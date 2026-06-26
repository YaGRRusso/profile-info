import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";
import { SortOrder } from "mongoose";
import type { FindManyQuery, FindOneQuery } from "../../types/input.type";
import type { BatchCount, MultiPaged } from "../../types/output.type";
import type { TenantScope } from "../../types/scope.type";

export interface CrudMapperInterface<TEntity, TModel> {
  toDomain(raw: TModel): TEntity;
  toPersistenceForCreate(entity: Partial<TEntity>): AnyKeys<TModel>;
  toPersistenceForFilter(entity: Partial<TEntity>): QueryFilter<TModel>;
  toPersistenceForSort(
    entity: Partial<TEntity>
  ): Record<keyof TModel, SortOrder>;
  toPersistenceForUpdate(entity: Partial<TEntity>): UpdateQuery<TModel>;
}

export interface CrudRepositoryInterface<TModel, TEntity> {
  createMany(createInputs: Partial<TEntity>[]): Promise<BatchCount>;
  createOne(createInput: Partial<TEntity>): Promise<TEntity>;

  deleteMany(filter: Partial<TEntity>): Promise<BatchCount>;
  deleteManyById(ids: string[]): Promise<BatchCount>;
  deleteOne(query: FindOneQuery<Partial<TEntity>>): Promise<TEntity>;
  deleteOneById(id: string): Promise<TEntity>;

  findMany(
    query: FindManyQuery<Partial<TEntity>, Partial<TEntity>>
  ): Promise<MultiPaged<TEntity>>;
  findManyById(ids: string[]): Promise<TEntity[]>;
  findOne(query: FindOneQuery<Partial<TEntity>>): Promise<TEntity>;
  findOneById(id: string): Promise<TEntity>;

  global(): CrudRepositoryInterface<TModel, TEntity>;
  scoped(scope: TenantScope): CrudRepositoryInterface<TModel, TEntity>;

  updateMany(
    filter: Partial<TEntity>,
    updateInput: Partial<TEntity>,
    options?: { arrayFilters?: Record<string, unknown>[] }
  ): Promise<BatchCount>;
  updateManyById(
    ids: string[],
    updateInput: Partial<TEntity>
  ): Promise<BatchCount>;
  updateOne(
    query: FindOneQuery<Partial<TEntity>>,
    updateInput: Partial<TEntity>
  ): Promise<TEntity>;
  updateOneById(id: string, updateInput: Partial<TEntity>): Promise<TEntity>;
}
