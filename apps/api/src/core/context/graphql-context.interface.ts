import type { Request } from "express";
import type { AuthContextUser } from "./auth-context.helper";

export interface GraphqlContext<TLoaders = unknown> {
  loaders: TLoaders;
  req: Request & { user?: AuthContextUser };
  res: unknown;
}
