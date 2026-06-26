export type Single<T> = T;
export type Multi<T> = T[];

export interface MultiPaged<T> {
  found: number;
  nodes: T[];
}

export interface BatchCount {
  failed: number;
  succeeded: number;
}
