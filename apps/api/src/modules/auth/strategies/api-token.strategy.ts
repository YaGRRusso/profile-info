import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { toApiTokenAuthContext } from "@/core/context/auth-context.helper";
import type { ApiTokenAuthContext } from "@/core/context/auth-context.interface";
import { ApiTokensService } from "@/modules/api-tokens/api-tokens.service";
import { UsersService } from "@/modules/users/users.service";

export const API_TOKEN_STRATEGY = "api-token" as const;
export const API_KEY_HEADER = "x-api-key" as const;

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  API_TOKEN_STRATEGY
) {
  constructor(
    private readonly apiTokensService: ApiTokensService,
    private readonly usersService: UsersService
  ) {
    super({ header: "X-Api-Key", prefix: "" }, false);
  }

  async validate(apiKey: string): Promise<ApiTokenAuthContext> {
    const verified = await this.apiTokensService.verify(apiKey);
    if (!verified) throw new UnauthorizedException();

    const user = await this.usersService.findOneById(verified.ownerId);
    if (!user) throw new UnauthorizedException();

    return toApiTokenAuthContext(user, verified.permissions);
  }
}
