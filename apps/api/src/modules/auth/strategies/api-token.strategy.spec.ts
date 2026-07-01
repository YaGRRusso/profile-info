import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { compare } from "bcryptjs";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { ApiTokensService } from "@/modules/api-tokens/api-tokens.service";
import { UsersService } from "@/modules/users/users.service";
import { ApiTokenStrategy } from "./api-token.strategy";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

const tokenId = "507f1f77bcf86cd799439013";
const ownerId = "507f1f77bcf86cd799439011";
const secret = "secret-value-32-chars-min!!";
const apiKey = `pi_${tokenId}_${secret}`;

const mockUser = {
  id: ownerId,
  name: "Alice",
  nickname: "alice",
  email: "alice@example.com",
  role: UserRole.USER,
  i18n: [],
  urls: [],
};

const mockTokenRecord = {
  id: tokenId,
  ownerId,
  name: "dev-token",
  hashedSecret: "hashed-secret",
  permissions: [ApiTokenPermission.QUERY],
};

const mockApiTokensService: Partial<jest.Mocked<ApiTokensService>> = {
  parseApiToken: jest.fn(),
  findOneByIdWithHashedSecret: jest.fn(),
};

const mockUsersService: Partial<jest.Mocked<UsersService>> = {
  findOneById: jest.fn(),
};

function mockValidTokenLookup() {
  (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue({
    tokenId,
    secret,
  });
  (
    mockApiTokensService.findOneByIdWithHashedSecret as jest.Mock
  ).mockResolvedValue(mockTokenRecord);
  (compare as jest.Mock).mockResolvedValue(true);
}

describe("ApiTokenStrategy", () => {
  let strategy: ApiTokenStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenStrategy,
        { provide: ApiTokensService, useValue: mockApiTokensService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get(ApiTokenStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("returns ApiTokenAuthContext when the credential is valid", async () => {
      mockValidTokenLookup();
      (mockUsersService.findOneById as jest.Mock).mockResolvedValue(mockUser);

      await expect(strategy.validate(apiKey)).resolves.toEqual({
        ...mockUser,
        credentialKind: CredentialKind.API_TOKEN,
        permissions: [ApiTokenPermission.QUERY],
      });

      expect(
        mockApiTokensService.findOneByIdWithHashedSecret
      ).toHaveBeenCalledWith(tokenId);
      expect(compare).toHaveBeenCalledWith(
        secret,
        mockTokenRecord.hashedSecret
      );
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(ownerId);
    });

    it("throws UnauthorizedException when parse fails", async () => {
      (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue(null);

      await expect(strategy.validate("invalid")).rejects.toThrow(
        UnauthorizedException
      );
      expect(
        mockApiTokensService.findOneByIdWithHashedSecret
      ).not.toHaveBeenCalled();
    });

    it("throws UnauthorizedException when findOneByIdWithHashedSecret resolves with a falsy token", async () => {
      (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue({
        tokenId,
        secret,
      });
      (
        mockApiTokensService.findOneByIdWithHashedSecret as jest.Mock
      ).mockResolvedValue(null);

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("propagates NotFoundException when findOneByIdWithHashedSecret rejects (repository behavior)", async () => {
      (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue({
        tokenId,
        secret,
      });
      (
        mockApiTokensService.findOneByIdWithHashedSecret as jest.Mock
      ).mockRejectedValue(new NotFoundException(PERSISTENCE_NOT_FOUND));

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        NotFoundException
      );
      await expect(strategy.validate(apiKey)).rejects.toThrow(
        PERSISTENCE_NOT_FOUND
      );
    });

    it("throws UnauthorizedException when the token is expired", async () => {
      (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue({
        tokenId,
        secret,
      });
      (
        mockApiTokensService.findOneByIdWithHashedSecret as jest.Mock
      ).mockResolvedValue({
        ...mockTokenRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("throws UnauthorizedException when the secret does not match", async () => {
      (mockApiTokensService.parseApiToken as jest.Mock).mockReturnValue({
        tokenId,
        secret,
      });
      (
        mockApiTokensService.findOneByIdWithHashedSecret as jest.Mock
      ).mockResolvedValue(mockTokenRecord);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("throws UnauthorizedException when findOneById resolves with a falsy user", async () => {
      mockValidTokenLookup();
      (mockUsersService.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("propagates NotFoundException when findOneById rejects (CrudRepository behavior)", async () => {
      mockValidTokenLookup();
      (mockUsersService.findOneById as jest.Mock).mockRejectedValue(
        new NotFoundException(PERSISTENCE_NOT_FOUND)
      );

      await expect(strategy.validate(apiKey)).rejects.toThrow(
        NotFoundException
      );
      await expect(strategy.validate(apiKey)).rejects.toThrow(
        PERSISTENCE_NOT_FOUND
      );
    });
  });
});
