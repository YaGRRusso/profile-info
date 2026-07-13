import { applyDecorators } from "@nestjs/common";
import { Field, FieldOptions, ReturnTypeFunc } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

/**
 * GraphQL nullable field. Applies `@IsOptional()` (skip validators when absent)
 * so ValidationPipe `whitelist` keeps the property. Stack `@Is*` for format rules.
 */
export function OptionalField(
  typeFunction: ReturnTypeFunc = () => String,
  options?: FieldOptions
): PropertyDecorator {
  return applyDecorators(
    // Transform(({ value }) => value ?? undefined),
    IsOptional(),
    Field(typeFunction, { ...options, nullable: true })
  );
}
