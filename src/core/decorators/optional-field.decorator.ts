import { applyDecorators } from "@nestjs/common";
import { Field, FieldOptions, ReturnTypeFunc } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

export function OptionalField(typeFunction: ReturnTypeFunc = () => String, options?: FieldOptions): PropertyDecorator {
  return applyDecorators(IsOptional(), Field(typeFunction, { ...options, nullable: true }));
}
