export interface FindOneQuery<TFilter = unknown> {
  filters?: TFilter;
}

export interface FindManyQuery<TFilter = unknown, TSort = unknown>
  extends FindOneQuery<TFilter> {
  limit?: number;
  skip?: number;
  sort?: TSort;
}
