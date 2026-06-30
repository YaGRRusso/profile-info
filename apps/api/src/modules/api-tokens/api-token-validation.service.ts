import { Injectable, UnauthorizedException } from "@nestjs/common";
import { toApiTokenAuthContext } from "@/core/context/auth-context.helper";
import type { ApiTokenAuthContext } from "@/core/context/auth-context.interface";
import { UsersService } from "@/modules/users/users.service";
import { ApiTokensRepository } from "./api-tokens.repository";
import {
  parseApiToken,
  verifyApiToken,
} from "./helpers/api-token-secret.helper";

@Injectable()
export class ApiTokenValidationService {
  constructor(
    private readonly repository: ApiTokensRepository,
    private readonly usersService: UsersService
  ) {}

  async validate(plaintext: string): Promise<ApiTokenAuthContext> {
    const parsed = parseApiToken(plaintext);
    if (!parsed) {
      throw new UnauthorizedException();
    }

    const record = await this.repository.findByIdForAuth(parsed.tokenId);
    if (!record) {
      throw new UnauthorizedException();
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }

    const secretMatches = await verifyApiToken(
      parsed.secret,
      record.hashedSecret
    );
    if (!secretMatches) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOneById(record.ownerId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return toApiTokenAuthContext(user, record.permissions);
  }
}
