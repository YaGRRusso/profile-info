import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export enum CourseStatusEnum {
  'COMPLETE' = 'COMPLETE',
  'INCOMPLETE' = 'INCOMPLETE',
  'PAUSED' = 'PAUSED',
  'PROGRESS' = 'PROGRESS',
}

export class CourseDto {
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
  status: CourseStatusEnum | string

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  certificate: string

  @ApiProperty({ type: 'number' })
  @IsInt()
  hours: number

  @ApiProperty({ type: 'string', isArray: true, required: false })
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
