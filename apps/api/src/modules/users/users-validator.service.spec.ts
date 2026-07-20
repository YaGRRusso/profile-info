import { UnauthorizedException } from "@nestjs/common";
import { UsersValidatorService } from "./users-validator.service";

describe("UsersValidatorService", () => {
  const service = new UsersValidatorService();

  it("allows enabled users", () => {
    expect(() => service.assertUserEnabled({ disabled: false })).not.toThrow();
  });

  it("rejects disabled users with a stable pending-approval message", () => {
    expect.assertions(2);

    try {
      service.assertUserEnabled({ disabled: true });
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      if (error instanceof UnauthorizedException) {
        expect(error.getResponse()).toEqual(
          expect.objectContaining({ message: "users.ACCOUNT_DISABLED" })
        );
      }
    }
  });
});
