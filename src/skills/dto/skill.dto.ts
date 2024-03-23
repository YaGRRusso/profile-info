import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export enum SkillCategoryEnum {
  'LANGUAGE' = 'LANGUAGE',
  'LIBRARY' = 'LIBRARY',
  'TOOL' = 'TOOL',
  'SYSTEM' = 'SYSTEM',
  'OTHER' = 'OTHER',
}

export class SkillDto {
  @ApiProperty({ type: 'string' })
  id: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    type: 'string',
    enum: SkillCategoryEnum,
    example: Object.keys(SkillCategoryEnum),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(SkillCategoryEnum)
  category: SkillCategoryEnum | string

  @ApiProperty({ type: 'string' })
  createdAt: Date

  @ApiProperty({ type: 'string' })
  updatedAt: Date

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  userId: string
}
