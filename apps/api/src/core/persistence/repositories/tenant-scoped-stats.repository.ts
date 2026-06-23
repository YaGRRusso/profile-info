import type { Model, SortOrder } from "mongoose";
import { withTenantScope } from "../helpers/tenant-scope.helper";
import type { TenantScope } from "../types/scope.type";

export class TenantScopedStatsRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async count(scope: TenantScope): Promise<number> {
    return await this.model.countDocuments(withTenantScope(scope)).exec();
  }

  async countByField(
    scope: TenantScope,
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.model.aggregate<{ _id: string; value: number }>([
      { $match: withTenantScope(scope) },
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async findRecentlyUpdated(
    scope: TenantScope,
    limit: number,
    projection: string
  ): Promise<Array<Record<string, unknown> & { updatedAt: Date }>> {
    const rows = await this.model
      .find(withTenantScope(scope))
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
