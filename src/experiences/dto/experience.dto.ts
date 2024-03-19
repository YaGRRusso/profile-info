import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class ExperienceDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  id: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  role: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  organization: string

  @ApiProperty({ type: 'string' })
  @IsString()
  description: string

  @ApiProperty({ type: 'string' })
  @IsDateString()
  start: Date

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsDateString()
  end?: Date

  @ApiProperty({ type: 'string', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  createdAt: Date

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  updatedAt: Date

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  userId: string
}
