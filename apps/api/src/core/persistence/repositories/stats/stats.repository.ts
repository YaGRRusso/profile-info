import type { Model, PipelineStage, QueryFilter, SortOrder } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  withTenantScope,
  withTenantScopeForAggregate,
} from "../../helpers/tenant-scope.helper";
import type { RecentUpdateRow } from "../../types/output.type";
import type { TenantScope } from "../../types/scope.type";
import type { StatsRepositoryInterface } from "./stats.interface";

export class StatsRepository<TModel>
  implements StatsRepositoryInterface<TModel>
{
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly currentScope?: TenantScope
  ) {}

  scoped(scope: TenantScope) {
    return new StatsRepository(this.model, scope);
  }

  global() {
    return new StatsRepository(this.model, undefined);
  }

  // --- scope ---

  private applyScope(filters: QueryFilter<TModel> = {}): QueryFilter<TModel> {
    const cleanFilters = clearObject(filters) as QueryFilter<TModel>;
    if (!this.currentScope || this.currentScope.crossTenant)
      return cleanFilters;
    return withTenantScope<TModel>(this.currentScope, cleanFilters);
  }

  private applyScopeForAggregate(
    filters: QueryFilter<TModel> = {}
  ): QueryFilter<TModel> {
    const cleanFilters = clearObject(filters) as QueryFilter<TModel>;
    if (!this.currentScope || this.currentScope.crossTenant)
      return cleanFilters;
    return withTenantScopeForAggregate<TModel>(this.currentScope, cleanFilters);
  }

  // --- read ---

  async count(filters: QueryFilter<TModel> = {}) {
    return await this.model.countDocuments(this.applyScope(filters)).exec();
  }

  async countByField(field: string, match: QueryFilter<TModel> = {}) {
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
    filters: QueryFilter<TModel> = {}
  ) {
    const rows = await this.model
      .find(this.applyScope(filters))
      .sort({ updatedAt: -1 as SortOrder })
      .limit(limit)
      .select(projection)
      .lean()
      .exec();

    return rows as unknown as RecentUpdateRow[];
  }
}
