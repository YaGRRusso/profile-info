import type { Request, Response } from "express";
import { Loaders } from "../helpers/loaders.helper";

export interface Ctx {
  loaders: Loaders;
  req: Request;
  res: Response;
}
