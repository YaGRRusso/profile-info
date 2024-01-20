import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateExperienceDto {
  @IsNotEmpty()
  @IsString()
  role: string

  @IsNotEmpty()
  @IsString()
  organization: string

  @IsString()
  description: string

  @IsDateString()
  start: string

  @IsOptional()
  @IsDateString()
  end?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills: string[]
}
