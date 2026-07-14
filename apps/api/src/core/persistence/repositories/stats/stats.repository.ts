import type { Model, PipelineStage, QueryFilter, SortOrder } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import { toObjectId } from "@/core/mappers/base.mapper";
import { noopScope } from "../../helpers/persistence-scope.helper";
import type { RecentUpdateRow } from "../../types/output.type";
import type { PersistenceScope } from "../../types/scope.type";
import type { StatsRepositoryInterface } from "./stats.interface";

export class StatsRepository<TModel>
  implements StatsRepositoryInterface<TModel>
{
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly currentScope?: PersistenceScope
  ) {}

  scoped(scope: PersistenceScope) {
    return new StatsRepository(this.model, scope);
  }

  global() {
    return new StatsRepository(this.model, noopScope());
  }

  // --- scope ---

  private resolveFilter(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    return clearObject(filters) as QueryFilter<TModel>;
  }

  private applyReadFilter(filters?: QueryFilter<TModel>): QueryFilter<TModel> {
    const clean = this.resolveFilter(filters);
    return this.currentScope?.query.forRead(clean) ?? clean;
  }

  private applyAggregateFilter(
    filters?: QueryFilter<TModel>
  ): QueryFilter<TModel> {
    const clean = this.resolveFilter(filters);
    const forAggregate = this.currentScope?.query.forAggregate;
    if (forAggregate) return forAggregate(clean);
    return this.currentScope?.query.forRead(clean) ?? clean;
  }

  // --- read ---

  async count(filters: QueryFilter<TModel> = {}) {
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyReadFilter(resolvedFilter);

    return await this.model.countDocuments(scopedFilter).exec();
  }

  async countByField(field: string, match: QueryFilter<TModel> = {}) {
    const resolvedFilter = this.resolveFilter(match);
    const scopedAggregateFilter = this.applyAggregateFilter(resolvedFilter);
    const pipeline: PipelineStage[] = [];

    if (Object.keys(scopedAggregateFilter).length > 0) {
      pipeline.push({ $match: scopedAggregateFilter });
    }

    pipeline.push(
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    );

    const rows = await this.model.aggregate<{ _id: unknown; value: number }>(
      pipeline
    );

    return rows.map((row) => ({ label: String(row._id), value: row.value }));
  }

  countByOwnerIds(ownerIds: string[]) {
    if (ownerIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.countByField("ownerId", {
      ownerId: { $in: ownerIds.map((id) => toObjectId(id)) },
    } as QueryFilter<TModel>);
  }

  async findRecentlyUpdated(
    limit: number,
    projection: string,
    filters: QueryFilter<TModel> = {}
  ) {
    const resolvedFilter = this.resolveFilter(filters);
    const scopedFilter = this.applyReadFilter(resolvedFilter);

    const rows = await this.model
      .find(scopedFilter)
      .sort({ updatedAt: -1 as SortOrder })
      .limit(limit)
      .select(projection)
      .lean()
      .exec();

    return rows as unknown as RecentUpdateRow[];
  }
}
