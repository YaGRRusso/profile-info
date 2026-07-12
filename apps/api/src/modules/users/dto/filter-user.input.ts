import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { IsBoolean } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class FilterUserInput extends PartialType(
  PickType(CreateUserInput, [
    "avatar",
    "name",
    "nickname",
    "phone",
    "email",
    "birth",
    "address",
    "i18n",
    "role",
    "urls",
  ] as const)
) {
  @OptionalField(() => Boolean)
  @IsBoolean()
  disabled?: boolean;
}
