/** biome-ignore-all lint/suspicious/noEmptyInterface: biome does not support augmentation of global interfaces */
import type { Request } from "express";
import type { AuthContextUser } from "@/core/context/auth-context.interface";

export interface AppLoaders {}

export interface GraphqlContext {
  loaders: AppLoaders;
  req: Request & { user?: AuthContextUser };
  res: unknown;
}
