/** biome-ignore-all lint/suspicious/noEmptyInterface: biome does not support augmentation of global interfaces */
import type { Request } from "express";
import type { AuthContext } from "@/core/context/auth-context.interface";

export interface AppLoaders {}
export interface AppRequest extends Request {
  user?: AuthContext;
}

export interface AppResponse extends Response {}

export interface GraphqlContext {
  loaders: AppLoaders;
  req: AppRequest;
  res: AppResponse;
}
