import { InputType, PartialType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class UpdateSkillInput extends PartialType(CreateSkillInput) {
  @OptionalField(() => Boolean)
  disabled?: boolean;
}
