import type { QueryFilter, SortOrder } from "mongoose";

export interface FindOneQuery<T> {
  filters?: QueryFilter<T>;
}

export interface FindManyQuery<T> extends FindOneQuery<T> {
  limit?: number;
  skip?: number;
  sort?: Partial<Record<keyof T, SortOrder>>;
}
