import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { UserEntityRecord } from "./entities/user.entity";
import { USER_ACCOUNT_DISABLED } from "./users.messages";

@Injectable()
export class UsersValidatorService {
  assertUserEnabled(user: Pick<UserEntityRecord, "disabled">): void {
    if (user.disabled) {
      throw new UnauthorizedException(USER_ACCOUNT_DISABLED);
    }
  }
}
