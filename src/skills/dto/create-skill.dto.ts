import { Skill, SkillCategoryEnum } from '../entities/skill.entity'

import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class CreateSkillDto implements Partial<Skill> {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillCategoryEnum)
  category: SkillCategoryEnum
}
