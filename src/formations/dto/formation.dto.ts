import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class FormationDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  id: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  school: string

  @ApiProperty({ type: 'string' })
  @IsString()
  description: string

  @ApiProperty({ type: 'string' })
  @IsString()
  status: string

  @ApiProperty({ type: 'string' })
  @IsString()
  certificate: string

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
