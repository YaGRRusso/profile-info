import type { Model, SortOrder } from "mongoose";

export class StatsRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async count(): Promise<number> {
    return await this.model.countDocuments().exec();
  }

  async countByField(
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.model.aggregate<{ _id: string; value: number }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async findRecentlyUpdated(
    limit: number,
    projection: string
  ): Promise<Array<Record<string, unknown> & { updatedAt: Date }>> {
    const rows = await this.model
      .find()
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
