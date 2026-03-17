import { QueryFilter, SortOrder } from "mongoose";

export interface Search<T extends object> {
  filters?: QueryFilter<T>;
  limit?: number;
  skip?: number;
  sort?: Partial<Record<keyof T | "createdAt" | "updatedAt", SortOrder>>;
}
