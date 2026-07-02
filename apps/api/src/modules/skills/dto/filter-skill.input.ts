import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class FilterSkillInput extends PartialType(
  PickType(CreateSkillInput, ["slug", "category"] as const)
) {
  @OptionalField(() => Boolean)
  disabled?: boolean;
}
