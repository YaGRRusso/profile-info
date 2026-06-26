import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
  testApiTokenAuthContext,
  testAuthContext,
} from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import { toTenantScope } from "@/core/context/auth-context.helper";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { createMockCrud } from "@/core/persistence/repositories/testing/service-spec.mock";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensService } from "./api-tokens.service";
import { emitApiToken } from "./helpers/api-token-secret.helper";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-secret"),
}));

jest.mock("./helpers/api-token-secret.helper", () => ({
  emitApiToken: jest.fn(),
}));

const validId = "507f1f77bcf86cd799439013";
const ownerId = "507f1f77bcf86cd799439011";
const ctx = testAuthContext({ userId: ownerId });
const apiTokenCtx = testApiTokenAuthContext([ApiTokenPermission.QUERY], {
  userId: ownerId,
});

const fakeEntity = {
  id: validId,
  ownerId,
  name: "dev-token",
  hashedSecret: "hashed-secret",
  permissions: [ApiTokenPermission.QUERY],
};

describe("ApiTokensService", () => {
  let service: ApiTokensService;
  let crud: ReturnType<typeof createMockCrud>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    jest.mocked(emitApiToken).mockReturnValue({
      plaintext: `pi_${validId}_secret-value`,
      tokenId: validId,
      secret: "secret-value",
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokensService,
        { provide: ApiTokensRepository, useValue: { crud } },
      ],
    }).compile();

    service = module.get(ApiTokensService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("session guard", () => {
    it("should reject API token auth context", () => {
      expect(() => service.findOneById(apiTokenCtx, validId)).toThrow(
        UnauthorizedException
      );
    });
  });

  describe("findOneById", () => {
    it("delegates to scoped crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    const createInput = {
      name: "dev-token",
      permissions: [ApiTokenPermission.QUERY],
    };

    it("hashes secret, assigns token id, and returns plaintext token", async () => {
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual({
        token: `pi_${validId}_secret-value`,
        apiToken: fakeEntity,
      });

      expect(emitApiToken).toHaveBeenCalled();
      expect(hash).toHaveBeenCalledWith("secret-value", 8);
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.createOne).toHaveBeenCalledWith({
        name: "dev-token",
        permissions: [ApiTokenPermission.QUERY],
        id: validId,
        hashedSecret: "hashed-secret",
      });
    });
  });

  describe("removeOne", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });
});
