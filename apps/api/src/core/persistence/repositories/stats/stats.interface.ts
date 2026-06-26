import type { QueryFilter } from "mongoose";
import type { FieldCount, RecentUpdateRow } from "../../types/output.type";
import type { TenantScope } from "../../types/scope.type";

export interface StatsRepositoryInterface<TModel> {
  count(filters?: QueryFilter<TModel>): Promise<number>;
  countByField(
    field: string,
    match?: QueryFilter<TModel>
  ): Promise<FieldCount[]>;
  findRecentlyUpdated(
    limit: number,
    projection: string,
    filters?: QueryFilter<TModel>
  ): Promise<RecentUpdateRow[]>;

  global(): StatsRepositoryInterface<TModel>;
  scoped(scope: TenantScope): StatsRepositoryInterface<TModel>;
}
