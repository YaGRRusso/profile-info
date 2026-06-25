import type { Model, PipelineStage, QueryFilter, SortOrder } from "mongoose";

export class StatsRepository<T> {
  constructor(readonly model: Model<T>) {}

  async count(filters: QueryFilter<T> = {}): Promise<number> {
    return await this.model.countDocuments(filters).exec();
  }

  async countByField(
    field: string,
    match: QueryFilter<T> = {}
  ): Promise<{ label: string; value: number }[]> {
    const pipeline: PipelineStage[] = [];

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
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
      .find(filters)
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
