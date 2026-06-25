import {
  withTenantScope,
  withTenantScopeForAggregate,
} from "../helpers/tenant-scope.helper";
import type { TenantScope } from "../types/scope.type";
import type { StatsRepository } from "./stats.repository";

export class TenantScopedStatsRepository<T> {
  constructor(private readonly repository: StatsRepository<T>) {}

  async count(scope: TenantScope): Promise<number> {
    return await this.repository.count(withTenantScope(scope));
  }

  async countByField(
    scope: TenantScope,
    field: string
  ): Promise<{ label: string; value: number }[]> {
    return await this.repository.countByField(
      field,
      withTenantScopeForAggregate(scope)
    );
  }

  async findRecentlyUpdated(
    scope: TenantScope,
    limit: number,
    projection: string
  ): Promise<Array<Record<string, unknown> & { updatedAt: Date }>> {
    return await this.repository.findRecentlyUpdated(
      limit,
      projection,
      withTenantScope(scope)
    );
  }
}
