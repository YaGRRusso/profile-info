import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { USER_ACCOUNT_DISABLED } from "@/modules/users/users.messages";
import { UsersService } from "@/modules/users/users.service";
import { UsersValidatorService } from "@/modules/users/users-validator.service";
import { JwtStrategy } from "./jwt.strategy";

const userId = "507f1f77bcf86cd799439011";

const mockUser = {
  disabled: false,
  email: "alice@example.com",
  i18n: [],
  id: userId,
  name: "Alice",
  nickname: "alice",
  role: UserRole.USER,
  urls: [],
};

const mockPayload = {
  role: UserRole.USER,
  sub: userId,
};

const mockUsersService: Partial<jest.Mocked<UsersService>> = {
  findOneById: jest.fn(),
};

const mockUsersValidator: Partial<jest.Mocked<UsersValidatorService>> = {
  assertUserEnabled: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue("test-jwt-secret"),
};

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: UsersValidatorService, useValue: mockUsersValidator },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("returns SessionAuthContext when the user exists", async () => {
      (mockUsersService.findOneById as jest.Mock).mockResolvedValue(mockUser);

      await expect(strategy.validate(mockPayload)).resolves.toEqual({
        ...mockUser,
        credentialKind: CredentialKind.SESSION,
      });

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
      expect(mockUsersValidator.assertUserEnabled).toHaveBeenCalledWith(
        mockUser
      );
    });

    it("throws UnauthorizedException when the account is disabled", async () => {
      (mockUsersService.findOneById as jest.Mock).mockResolvedValue({
        ...mockUser,
        disabled: true,
      });
      (mockUsersValidator.assertUserEnabled as jest.Mock).mockImplementation(
        () => {
          throw new UnauthorizedException(USER_ACCOUNT_DISABLED);
        }
      );

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("throws UnauthorizedException when findOneById resolves with a falsy user", async () => {
      (mockUsersService.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("propagates NotFoundException when findOneById rejects (CrudRepository behavior)", async () => {
      (mockUsersService.findOneById as jest.Mock).mockRejectedValue(
        new NotFoundException(PERSISTENCE_NOT_FOUND)
      );

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        NotFoundException
      );
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        PERSISTENCE_NOT_FOUND
      );
    });
  });
});
