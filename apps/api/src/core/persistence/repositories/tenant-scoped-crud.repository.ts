import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { withTenantScope } from "../helpers/tenant-scope.helper";
import type { FindManyQuery, FindOneQuery } from "../types/input.type";
import type { BatchCount, MultiPaged } from "../types/output.type";
import type { TenantScope } from "../types/scope.type";
import type { CrudRepository } from "./crud.repository";

export class TenantScopedCrudRepository<TModel, TEntity> {
  constructor(private readonly repository: CrudRepository<TModel, TEntity>) {}

  async findOneById(scope: TenantScope, id: string): Promise<TEntity> {
    assertValidObjectId(id);

    if (scope.crossTenant) {
      return await this.repository.findOneById(id);
    }

    return await this.repository.findOne({
      filters: withTenantScope<TModel>(scope, {
        _id: id,
      } as QueryFilter<TModel>),
    });
  }

  async findOne(
    scope: TenantScope,
    query: FindOneQuery<TModel>
  ): Promise<TEntity> {
    return await this.repository.findOne({
      filters: withTenantScope<TModel>(scope, query.filters),
    });
  }

  async findManyById(scope: TenantScope, ids: string[]): Promise<TEntity[]> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    if (scope.crossTenant) {
      return await this.repository.findManyById(ids);
    }

    const { nodes } = await this.repository.findMany({
      filters: withTenantScope<TModel>(scope, {
        _id: { $in: ids },
      } as QueryFilter<TModel>),
      limit: ids.length,
    });

    return nodes;
  }

  async findMany(
    scope: TenantScope,
    query: FindManyQuery<TModel>
  ): Promise<MultiPaged<TEntity>> {
    return await this.repository.findMany({
      ...query,
      filters: withTenantScope<TModel>(scope, query.filters),
    });
  }

  async createOne(
    scope: TenantScope,
    createInput: AnyKeys<TModel>
  ): Promise<TEntity> {
    const { ownerId: _, ...rest } = createInput as AnyKeys<TModel> & {
      ownerId?: string;
    };

    return await this.repository.createOne({
      ...rest,
      ownerId: scope.userId,
    } as AnyKeys<TModel>);
  }

  async createMany(
    scope: TenantScope,
    createInputs: AnyKeys<TModel>[]
  ): Promise<BatchCount> {
    const payloads = createInputs.map((input) => {
      const { ownerId: _, ...rest } = input as AnyKeys<TModel> & {
        ownerId?: string;
      };

      return {
        ...rest,
        ownerId: scope.userId,
      };
    });

    return await this.repository.createMany(payloads as AnyKeys<TModel>[]);
  }

  async updateOneById(
    scope: TenantScope,
    id: string,
    updateInput: UpdateQuery<TModel>
  ): Promise<TEntity> {
    assertValidObjectId(id);

    return await this.repository.updateOne(
      {
        filters: withTenantScope<TModel>(scope, {
          _id: id,
        } as QueryFilter<TModel>),
      },
      updateInput
    );
  }

  async updateManyById(
    scope: TenantScope,
    ids: string[],
    updateInput: UpdateQuery<TModel>
  ): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    if (scope.crossTenant) {
      return await this.repository.updateManyById(ids, updateInput);
    }

    const result = await this.repository.updateMany(
      withTenantScope<TModel>(scope, {
        _id: { $in: ids },
      } as QueryFilter<TModel>),
      updateInput
    );

    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }

  async deleteOneById(scope: TenantScope, id: string): Promise<TEntity> {
    assertValidObjectId(id);

    return await this.repository.deleteOne({
      filters: withTenantScope<TModel>(scope, {
        _id: id,
      } as QueryFilter<TModel>),
    });
  }

  async deleteManyById(scope: TenantScope, ids: string[]): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    if (scope.crossTenant) {
      return await this.repository.deleteManyById(ids);
    }

    const result = await this.repository.deleteMany(
      withTenantScope<TModel>(scope, {
        _id: { $in: ids },
      } as QueryFilter<TModel>)
    );

    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }
}
