import { Role, RoleEnum } from '@interfaces/role.interface'

import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator'

export class UserDto {
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
  @IsDateString()
  birth: Date

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minLength: 8,
  })
  password: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  nickname: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Length(11)
  phone: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  picture: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  address: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Length(8)
  postal: string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({ type: 'string', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @ApiProperty({
    type: 'string',
    enum: RoleEnum,
    example: Object.keys(RoleEnum),
  })
  @IsNotEmpty()
  @IsString()
  role: Role | string

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  createdAt: Date

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  updatedAt: Date
}
