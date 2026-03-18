import { Resolver } from "@nestjs/graphql";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill-input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Resolver(() => SkillEntity)
export class SkillsResolver extends BaseResolver<
  SkillModel,
  SkillEntity,
  CreateSkillInput,
  UpdateSkillInput,
  FilterSkillInput
>(SkillEntity, CreateSkillInput, UpdateSkillInput, FilterSkillInput) {
  constructor(readonly skillsService: SkillsService) {
    super(skillsService);
  }
}
