import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import { toTenantScope } from "@/core/context/auth-context.helper";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { createMockCrud } from "@/core/persistence/repositories/testing/service-spec.mock";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensService } from "./api-tokens.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-secret"),
}));

const validId = "507f1f77bcf86cd799439013";
const ownerId = "507f1f77bcf86cd799439011";
const ctx = testAuthContext({ id: ownerId });

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
    jest
      .spyOn(
        ApiTokensService.prototype as unknown as {
          emitApiToken: () => {
            plaintext: string;
            tokenId: string;
            secret: string;
          };
        },
        "emitApiToken"
      )
      .mockReturnValue({
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
