import { UnauthorizedException } from "@nestjs/common";
import { UsersValidatorService } from "./users-validator.service";

describe("UsersValidatorService", () => {
  const service = new UsersValidatorService();

  it("allows enabled users", () => {
    expect(() => service.assertUserEnabled({ disabled: false })).not.toThrow();
  });

  it("rejects disabled users", () => {
    expect(() => service.assertUserEnabled({ disabled: true })).toThrow(
      UnauthorizedException
    );
  });
});
