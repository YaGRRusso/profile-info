import type { Request } from "express";
import type { Loaders } from "./compose-loaders";

export interface Ctx {
  loaders: Loaders;
  req: Request & { user?: unknown };
  res: unknown;
}
