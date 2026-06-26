import type { Model, PipelineStage, QueryFilter, SortOrder } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  withTenantScope,
  withTenantScopeForAggregate,
} from "../helpers/tenant-scope.helper";
import type { TenantScope } from "../types/scope.type";

export class StatsRepository<T> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly currentScope?: TenantScope
  ) {}

  scoped(scope: TenantScope): StatsRepository<T> {
    return new StatsRepository(this.model, scope);
  }

  global(): StatsRepository<T> {
    return new StatsRepository(this.model, undefined);
  }

  // --- scope ---

  private applyScope(filters: QueryFilter<T> = {}): QueryFilter<T> {
    const cleanFilters = clearObject(filters) as QueryFilter<T>;
    if (!this.currentScope || this.currentScope.crossTenant)
      return cleanFilters;
    return withTenantScope<T>(this.currentScope, cleanFilters);
  }

  private applyScopeForAggregate(filters: QueryFilter<T> = {}): QueryFilter<T> {
    const cleanFilters = clearObject(filters) as QueryFilter<T>;
    if (!this.currentScope || this.currentScope.crossTenant)
      return cleanFilters;
    return withTenantScopeForAggregate<T>(this.currentScope, cleanFilters);
  }

  // --- read ---

  async count(filters: QueryFilter<T> = {}): Promise<number> {
    return await this.model.countDocuments(this.applyScope(filters)).exec();
  }

  async countByField(
    field: string,
    match: QueryFilter<T> = {}
  ): Promise<{ label: string; value: number }[]> {
    const scopedMatch = this.applyScopeForAggregate(match);
    const pipeline: PipelineStage[] = [];

    if (Object.keys(scopedMatch).length > 0) {
      pipeline.push({ $match: scopedMatch });
    }

    pipeline.push(
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    );

    const rows = await this.model.aggregate<{ _id: string; value: number }>(
      pipeline
    );

    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async findRecentlyUpdated(
    limit: number,
    projection: string,
    filters: QueryFilter<T> = {}
  ): Promise<Array<Record<string, unknown> & { updatedAt: Date }>> {
    const rows = await this.model
      .find(this.applyScope(filters))
      .sort({ updatedAt: -1 as SortOrder })
      .limit(limit)
      .select(projection)
      .lean()
      .exec();

    return rows as unknown as Array<
      Record<string, unknown> & { updatedAt: Date }
    >;
  }
}
