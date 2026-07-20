import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "@/core/configs/env.validation";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import type { SessionAuthContext } from "@/core/context/auth-context.interface";
import { i18nKey } from "@/core/i18n/i18n";
import { UsersService } from "@/modules/users/users.service";
import { UsersValidatorService } from "@/modules/users/users-validator.service";
import { JwtPayload } from "../entities/jwt.entity";

export const JWT_STRATEGY = "jwt" as const;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    config: ConfigService<Env, true>,
    private readonly usersService: UsersService,
    private readonly usersValidator: UsersValidatorService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<SessionAuthContext> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) throw new UnauthorizedException(i18nKey("auth.UNAUTHORIZED"));

    this.usersValidator.assertUserEnabled(user);

    return toSessionAuthContext(user);
  }
}
