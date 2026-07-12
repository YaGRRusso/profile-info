import { InputType, PartialType } from "@nestjs/graphql";
import { IsBoolean } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @OptionalField(() => Boolean)
  @IsBoolean()
  disabled?: boolean;
}
