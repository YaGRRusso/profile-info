import type { BaseEntity } from "@/core/entities/base.entity";
import type { BaseModel } from "@/core/schemas/base.schema";

export function toBaseEntityFields(
  model: BaseModel
): Pick<BaseEntity, "id" | "createdAt" | "updatedAt"> {
  return {
    id: String(model.id),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function toIdString(
  value: string | { toString(): string } | undefined
): string | undefined {
  return value == null ? undefined : String(value);
}

export function toIdStrings(
  values: (string | { toString(): string })[] | undefined
): string[] | undefined {
  return values?.map((value) => String(value));
}
