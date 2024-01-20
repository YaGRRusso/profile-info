import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateCourseDto {
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

  @IsInt()
  hours: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills: string[]
}
