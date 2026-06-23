import type { AnyKeys, QueryFilter, UpdateQuery } from "mongoose";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { withTenantScope } from "../helpers/tenant-scope.helper";
import type { FindManyQuery, FindOneQuery } from "../types/input.type";
import type {
  BatchCount,
  Multi,
  MultiPaged,
  Single,
} from "../types/output.type";
import type { TenantScope } from "../types/scope.type";
import type { CrudRepository } from "./crud.repository";

export class TenantScopedRepository<T> {
  constructor(private readonly repository: CrudRepository<T>) {}

  async findOneById(scope: TenantScope, id: string): Promise<Single<T>> {
    assertValidObjectId(id);

    if (scope.crossTenant) {
      return await this.repository.findOneById(id);
    }

    return await this.repository.findOne({
      filters: withTenantScope<T>(scope, { _id: id } as QueryFilter<T>),
    });
  }

  findOne(scope: TenantScope, query: FindOneQuery<T>): Promise<Single<T>> {
    return this.repository.findOne({
      filters: withTenantScope<T>(scope, query.filters),
    });
  }

  async findManyById(scope: TenantScope, ids: string[]): Promise<Multi<T>> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return [];

    if (scope.crossTenant) {
      return await this.repository.findManyById(ids);
    }

    const { nodes } = await this.repository.findMany({
      filters: withTenantScope<T>(scope, {
        _id: { $in: ids },
      } as QueryFilter<T>),
      limit: ids.length,
    });

    return nodes;
  }

  findMany(
    scope: TenantScope,
    query: FindManyQuery<T>
  ): Promise<MultiPaged<T>> {
    return this.repository.findMany({
      ...query,
      filters: withTenantScope<T>(scope, query.filters),
    });
  }

  createOne(scope: TenantScope, createInput: AnyKeys<T>): Promise<Single<T>> {
    const { ownerId: _, ...rest } = createInput as AnyKeys<T> & {
      ownerId?: string;
    };

    return this.repository.createOne({
      ...rest,
      ownerId: scope.userId,
    } as AnyKeys<T>);
  }

  createMany(
    scope: TenantScope,
    createInputs: AnyKeys<T>[]
  ): Promise<BatchCount> {
    const payloads = createInputs.map((input) => {
      const { ownerId: _, ...rest } = input as AnyKeys<T> & {
        ownerId?: string;
      };

      return {
        ...rest,
        ownerId: scope.userId,
      };
    });

    return this.repository.createMany(payloads as AnyKeys<T>[]);
  }

  async updateOneById(
    scope: TenantScope,
    id: string,
    updateInput: UpdateQuery<T>
  ): Promise<Single<T>> {
    assertValidObjectId(id);

    return await this.repository.updateOne(
      { filters: withTenantScope<T>(scope, { _id: id } as QueryFilter<T>) },
      updateInput
    );
  }

  async updateManyById(
    scope: TenantScope,
    ids: string[],
    updateInput: UpdateQuery<T>
  ): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    if (scope.crossTenant) {
      return await this.repository.updateManyById(ids, updateInput);
    }

    const result = await this.repository.updateMany(
      withTenantScope<T>(scope, { _id: { $in: ids } } as QueryFilter<T>),
      updateInput
    );

    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }

  async deleteOneById(scope: TenantScope, id: string): Promise<Single<T>> {
    assertValidObjectId(id);

    return await this.repository.deleteOne({
      filters: withTenantScope<T>(scope, { _id: id } as QueryFilter<T>),
    });
  }

  async deleteManyById(scope: TenantScope, ids: string[]): Promise<BatchCount> {
    assertValidObjectIds(ids);
    if (ids.length === 0) return { succeeded: 0, failed: 0 };

    if (scope.crossTenant) {
      return await this.repository.deleteManyById(ids);
    }

    const result = await this.repository.deleteMany(
      withTenantScope<T>(scope, { _id: { $in: ids } } as QueryFilter<T>)
    );

    return {
      succeeded: result.succeeded,
      failed: ids.length - result.succeeded,
    };
  }
}
