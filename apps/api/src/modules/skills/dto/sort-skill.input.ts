import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { SkillEntity } from "../entities/skill.entity";

@InputType()
export class SortSkillInput extends SortType(SkillEntity, [
  "slug",
  "createdAt",
  "updatedAt",
]) {}
