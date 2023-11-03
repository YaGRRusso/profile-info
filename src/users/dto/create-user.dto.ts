import { Create } from 'src/common/interfaces/input.interface'
import { User } from '../entities/user.entity'
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto implements Create<User> {
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsNotEmpty()
  @IsDate()
  birth?: Date

  @IsNotEmpty()
  @IsString()
  city?: string

  @IsNotEmpty()
  @IsString()
  country?: string

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
  @Length(8)
  postal?: string

  @IsNotEmpty()
  @IsString()
  presentation?: string

  @IsNotEmpty()
  @IsString()
  state?: string

  @IsNotEmpty()
  @IsString()
  title?: string
}
