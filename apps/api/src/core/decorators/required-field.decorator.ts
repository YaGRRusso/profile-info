import { applyDecorators } from "@nestjs/common";
import { Field, FieldOptions, ReturnTypeFunc } from "@nestjs/graphql";
import { IsDefined } from "class-validator";

/**
 * GraphQL required field. Applies `@IsDefined()` (value must be present) so
 * ValidationPipe `whitelist` keeps the property. Stack `@Is*` for format rules.
 */
export function RequiredField(
  typeFunction: ReturnTypeFunc = () => String,
  options?: FieldOptions
): PropertyDecorator {
  return applyDecorators(IsDefined(), Field(typeFunction, options));
}
