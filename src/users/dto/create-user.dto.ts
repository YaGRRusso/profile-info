import { User } from '../entities/user.entity'
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator'

export class CreateUserDto implements Partial<User> {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsDateString()
  birth: Date

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string

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

  @IsNotEmpty()
  @IsString()
  nickname: string

  @IsNotEmpty()
  @IsString()
  @Length(11)
  phone: string

  @IsNotEmpty()
  @IsString()
  picture: string

  @IsNotEmpty()
  @IsString()
  address: string

  @IsNotEmpty()
  @IsString()
  @Length(8)
  postal: string

  @IsNotEmpty()
  @IsString()
  presentation: string

  @IsNotEmpty()
  @IsString()
  title: string
}
