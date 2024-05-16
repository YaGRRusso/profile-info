import { UserPayload } from '../entities/payload.entity'

import { JwtUser } from '@/auth/entities/user.entity'

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { config } from 'dotenv'
import { ExtractJwt, Strategy } from 'passport-jwt'

config()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: UserPayload): Promise<JwtUser> {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    }
  }
}
