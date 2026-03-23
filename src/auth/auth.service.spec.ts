import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { compare } from "bcryptjs";
import { UsersService } from "@/users/users.service";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

const mockUser = {
  id: "user-id-123",
  email: "user@example.com",
  password: "hashed-password",
  role: "USER",
};

const mockUsersService: Partial<jest.Mocked<UsersService>> = {
  findOne: jest.fn(),
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
      (mockUsersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue("jwt-token");

      const token = await service.signIn(credentials);

      expect(token).toBe("jwt-token");
      expect(mockUsersService.findOne).toHaveBeenCalledWith({
        filters: { email: credentials.email },
      });
      expect(compare).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      (mockUsersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      (mockUsersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
