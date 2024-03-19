import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ProjectDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  id: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ type: 'string' })
  @IsString()
  description: string

  @ApiProperty({ type: 'string' })
  @IsString()
  image: string

  @ApiProperty({ type: 'string' })
  @IsString()
  link: string

  @ApiProperty({ type: 'string' })
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
