import { isNil } from "lodash";
import mongoose from "mongoose";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import type { BaseEntity } from "@/core/entities/base.entity";
import type { BaseModel } from "@/core/schemas/base.schema";

export function toBaseEntityFields(
  model: BaseModel
): Pick<BaseEntity, "id" | "createdAt" | "updatedAt"> {
  return {
    createdAt: model.createdAt,
    id: String(model.id),
    updatedAt: model.updatedAt,
  };
}

export function toIdString(
  value: string | { toString: () => string } | undefined
): string | undefined {
  if (isNil(value)) return;
  return String(value);
}

export function toIdStrings(
  values: (string | { toString: () => string })[] | undefined
): string[] | undefined {
  return values?.map((value) => String(value));
}

export function toObjectId(
  value: string | { toString: () => string }
): mongoose.Types.ObjectId {
  const id = String(value);
  assertValidObjectId(id);
  return new mongoose.Types.ObjectId(id);
}

export function toObjectIds(
  values: string[] | null | undefined
): mongoose.Types.ObjectId[] | null | undefined {
  if (isNil(values)) return values;
  assertValidObjectIds(values);
  return values.map((value) => new mongoose.Types.ObjectId(value));
}
