import type { Request } from "express";
import type { Loaders } from "./loaders.service";

export interface Ctx {
  loaders: Loaders;
  req: Request & { user?: unknown };
  res: unknown;
}
