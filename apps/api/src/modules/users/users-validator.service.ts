import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { UserEntityRecord } from "./entities/user.entity";

@Injectable()
export class UsersValidatorService {
  assertUserEnabled(user: Pick<UserEntityRecord, "disabled">): void {
    if (user.disabled) {
      throw new UnauthorizedException();
    }
  }
}
