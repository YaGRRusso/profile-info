import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { SkillCategoryEnum, SkillLevelEnum } from '../entities/skill.entity'

export class CreateSkillDto {
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillLevelEnum)
  level?: SkillLevelEnum

  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillCategoryEnum)
  category?: SkillCategoryEnum
}
