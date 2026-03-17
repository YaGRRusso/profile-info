import { InputType, PartialType } from "@nestjs/graphql";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class FilterSkillInput extends PartialType(CreateSkillInput) {}
