import { Injectable, UnauthorizedException } from "@nestjs/common";
import { i18nKey } from "@/core/i18n/i18n";
import type { UserEntityRecord } from "./entities/user.entity";

@Injectable()
export class UsersValidatorService {
  assertUserEnabled(user: Pick<UserEntityRecord, "disabled">): void {
    if (user.disabled) {
      throw new UnauthorizedException(i18nKey("users.ACCOUNT_DISABLED"));
    }
  }
}
