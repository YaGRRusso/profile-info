import { Type } from "@nestjs/common";
import { InputType } from "@nestjs/graphql";
import { OptionalField } from "../decorators/optional-field.decorator";
import { SortEnum } from "../enums/sort.enum";

export function SortType<
  ClassType extends object,
  KeysType extends keyof ClassType,
>(_ref: Type<ClassType>, keys: readonly KeysType[]) {
  @InputType({ isAbstract: true })
  abstract class SortInputClass {}

  for (const key of keys) {
    OptionalField(() => SortEnum)(SortInputClass.prototype, key as string);
  }

  return SortInputClass;
}
