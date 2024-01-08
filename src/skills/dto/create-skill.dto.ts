import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import {
  Skill,
  SkillCategoryEnum,
  SkillLevelEnum,
} from '../entities/skill.entity'

export class CreateSkillDto implements Partial<Skill> {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillLevelEnum)
  level: SkillLevelEnum

  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillCategoryEnum)
  category: SkillCategoryEnum
}
