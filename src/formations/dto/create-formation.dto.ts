import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateFormationDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  school: string

  @IsString()
  description: string

  @IsString()
  status: string

  @IsString()
  certificate: string

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
