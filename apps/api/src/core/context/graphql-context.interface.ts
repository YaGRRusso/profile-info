import type { Request } from "express";

export interface GraphqlContext<TLoaders = unknown> {
  loaders: TLoaders;
  req: Request & { user?: unknown };
  res: unknown;
}
