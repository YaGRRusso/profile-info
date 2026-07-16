import { UnauthorizedException } from "@nestjs/common";
import { USER_ACCOUNT_DISABLED } from "./users.messages";
import { UsersValidatorService } from "./users-validator.service";

describe("UsersValidatorService", () => {
  const service = new UsersValidatorService();

  it("allows enabled users", () => {
    expect(() => service.assertUserEnabled({ disabled: false })).not.toThrow();
  });

  it("rejects disabled users with a stable pending-approval message", () => {
    expect(() => service.assertUserEnabled({ disabled: true })).toThrow(
      UnauthorizedException
    );
    expect(() => service.assertUserEnabled({ disabled: true })).toThrow(
      USER_ACCOUNT_DISABLED
    );
  });
});
