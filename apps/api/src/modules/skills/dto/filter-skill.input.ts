import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class FilterSkillInput extends PartialType(
  PickType(CreateSkillInput, ["relevance", "slug", "name", "category"] as const)
) {}
