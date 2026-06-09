import type { Request, Response } from "express";
import { Loaders } from "./loaders.helper";

export interface Ctx {
  loaders: Loaders;
  req: Request;
  res: Response;
}
