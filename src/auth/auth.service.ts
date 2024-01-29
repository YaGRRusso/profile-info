import * as bcrypt from 'bcrypt'
import { Output } from '@interfaces/output.interface'
import { Role } from '@interfaces/role.interface'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@src/users/entities/user.entity'
import { UsersService } from '@src/users/users.service'
import { UserPayload } from './entities/payload.entity'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Output<string> {
    const user = await this.validate(email, password)

    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    }

    return this.jwtService.sign(payload)
  }

  async validate(email: string, password: string): Output<User> {
    const res = await this.usersService.searchAll({ email })
    const user = res[0]

    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    } else {
      throw new HttpException('NotFound', HttpStatus.NOT_FOUND)
    }
  }
}
