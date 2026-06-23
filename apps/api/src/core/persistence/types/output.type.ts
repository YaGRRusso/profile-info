import type { PaginatedModel } from "@/core/schemas/paginated.schema";

export type Single<T> = T;
export type Multi<T> = T[];
export type MultiPaged<T> = PaginatedModel<T>;

export interface BatchCount {
  failed: number;
  succeeded: number;
}
