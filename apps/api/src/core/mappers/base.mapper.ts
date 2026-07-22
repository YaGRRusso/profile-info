import { isNil } from "lodash";
import mongoose from "mongoose";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import type { BaseEntity } from "@/core/entities/base.entity";
import type { BaseModel } from "@/core/schemas/base.schema";

export type IdLike = string | { toString: () => string } | null | undefined;
export type IdLikeList = IdLike[] | null | undefined;

export function toBaseEntityFields(
  model: BaseModel
): Pick<BaseEntity, "id" | "createdAt" | "updatedAt"> {
  return {
    createdAt: model.createdAt,
    id: String(model.id),
    updatedAt: model.updatedAt,
  };
}

export function toIdString(value: IdLike): string | null | undefined {
  if (isNil(value)) return value;
  return String(value);
}

export function toIdStrings(values: IdLikeList): string[] | null | undefined {
  if (isNil(values)) return values;
  return values.map((value) => String(value));
}

export function toObjectId(
  value: IdLike
): mongoose.Types.ObjectId | null | undefined {
  if (isNil(value)) return value;
  const id = String(value);
  assertValidObjectId(id);
  return new mongoose.Types.ObjectId(id);
}

export function toObjectIds(
  values: IdLikeList
): mongoose.Types.ObjectId[] | null | undefined {
  if (isNil(values)) return values;
  const ids = values.map((value) => String(value));
  assertValidObjectIds(ids);
  return ids.map((id) => new mongoose.Types.ObjectId(id));
}
