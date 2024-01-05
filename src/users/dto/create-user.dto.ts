import { User } from '../entities/user.entity'
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto implements Partial<User> {
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsNotEmpty()
  @IsDate()
  birth?: Date

  @IsNotEmpty()
  @IsString()
  description?: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email?: string

  @IsNotEmpty()
  @IsString()
  nickname?: string

  @IsNotEmpty()
  @IsString()
  @Length(11)
  phone?: string

  @IsNotEmpty()
  @IsString()
  picture?: string

  @IsNotEmpty()
  @IsString()
  address?: string

  @IsNotEmpty()
  @IsString()
  @Length(8)
  postal?: string

  @IsNotEmpty()
  @IsString()
  presentation?: string

  @IsNotEmpty()
  @IsString()
  title?: string
}
