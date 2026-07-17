import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { compare } from "bcryptjs";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { AUTH_UNAUTHORIZED } from "@/core/auth/auth.messages";
import { toApiTokenAuthContext } from "@/core/context/auth-context.helper";
import type { ApiTokenAuthContext } from "@/core/context/auth-context.interface";
import { ApiTokensService } from "@/modules/api-tokens/api-tokens.service";
import { UsersService } from "@/modules/users/users.service";
import { UsersValidatorService } from "@/modules/users/users-validator.service";

export const API_TOKEN_STRATEGY = "api-token" as const;
export const API_KEY_HEADER = "x-api-key" as const;

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  API_TOKEN_STRATEGY
) {
  constructor(
    private readonly apiTokensService: ApiTokensService,
    private readonly usersService: UsersService,
    private readonly usersValidator: UsersValidatorService
  ) {
    super({ header: "X-Api-Key", prefix: "" }, false);
  }

  async validate(apiKey: string): Promise<ApiTokenAuthContext> {
    const parsed = this.apiTokensService.parseApiToken(apiKey);
    if (!parsed) {
      throw new UnauthorizedException(AUTH_UNAUTHORIZED);
    }

    const token = await this.apiTokensService.findOneByIdWithHashedSecret(
      parsed.tokenId
    );
    if (!token) {
      throw new UnauthorizedException(AUTH_UNAUTHORIZED);
    }

    const isExpired =
      token.expiresAt && token.expiresAt.getTime() <= Date.now();
    if (isExpired) {
      throw new UnauthorizedException(AUTH_UNAUTHORIZED);
    }

    const secretMatches = await compare(parsed.secret, token.hashedSecret);
    if (!secretMatches) {
      throw new UnauthorizedException(AUTH_UNAUTHORIZED);
    }

    const user = await this.usersService.findOneById(token.ownerId);
    if (!user) throw new UnauthorizedException(AUTH_UNAUTHORIZED);

    this.usersValidator.assertUserEnabled(user);

    return toApiTokenAuthContext(user, token.permissions);
  }
}
