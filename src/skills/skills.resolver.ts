import { Resolver } from "@nestjs/graphql";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill-input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => SkillEntity)
export class SkillsResolver extends BaseResolver<
  SkillModel,
  SkillEntity,
  CreateSkillInput,
  UpdateSkillInput,
  FilterSkillInput,
  SortSkillInput
>(
  SkillEntity,
  CreateSkillInput,
  UpdateSkillInput,
  FilterSkillInput,
  SortSkillInput
) {
  constructor(readonly skillsService: SkillsService) {
    super(skillsService);
  }
}
