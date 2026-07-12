import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { compare } from "bcryptjs";
import { UserRole } from "@/core/enums/user-role.enum";
import { UsersService } from "@/modules/users/users.service";
import { UsersValidatorService } from "@/modules/users/users-validator.service";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

const mockUser = {
  id: "user-id-123",
  email: "user@example.com",
  password: "hashed-password",
  role: UserRole.USER,
  disabled: false,
};

const mockUsersService: Partial<jest.Mocked<UsersService>> = {
  findOneByEmailWithPassword: jest.fn(),
  register: jest.fn(),
};

const mockUsersValidator: Partial<jest.Mocked<UsersValidatorService>> = {
  assertUserEnabled: jest.fn(),
};

const mockJwtService: Partial<jest.Mocked<JwtService>> = {
  signAsync: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: UsersValidatorService, useValue: mockUsersValidator },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------------------------------------ //
  // signIn
  // ------------------------------------------------------------------ //

  describe("signIn", () => {
    const credentials = { email: "user@example.com", password: "plain-pass" };

    it("should return a JWT token when credentials are valid", async () => {
      (
        mockUsersService.findOneByEmailWithPassword as jest.Mock
      ).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue("jwt-token");

      const token = await service.signIn(credentials);

      expect(token).toBe("jwt-token");
      expect(mockUsersService.findOneByEmailWithPassword).toHaveBeenCalledWith(
        credentials.email
      );
      expect(compare).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(mockUsersValidator.assertUserEnabled).toHaveBeenCalledWith(
        mockUser
      );
    });

    it("should throw UnauthorizedException when the account is disabled", async () => {
      (
        mockUsersService.findOneByEmailWithPassword as jest.Mock
      ).mockResolvedValue({ ...mockUser, disabled: true });
      (compare as jest.Mock).mockResolvedValue(true);
      (mockUsersValidator.assertUserEnabled as jest.Mock).mockImplementation(
        () => {
          throw new UnauthorizedException();
        }
      );

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      (
        mockUsersService.findOneByEmailWithPassword as jest.Mock
      ).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw NotFoundException when user is not found", async () => {
      (
        mockUsersService.findOneByEmailWithPassword as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
