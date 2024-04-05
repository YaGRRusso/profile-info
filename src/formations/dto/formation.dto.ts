import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export enum FormationStatusEnum {
  'COMPLETE' = 'COMPLETE',
  'INCOMPLETE' = 'INCOMPLETE',
  'PAUSED' = 'PAUSED',
  'PROGRESS' = 'PROGRESS',
}

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

  @ApiProperty({
    type: 'string',
    enum: FormationStatusEnum,
    example: Object.keys(FormationStatusEnum),
  })
  @IsString()
  status: FormationStatusEnum | string

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  certificate?: string

  @ApiProperty({ type: 'string' })
  @IsDateString()
  start: Date

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsDateString()
  end?: Date

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
