import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
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
  hashedSecret: "hashed-secret",
  id: validId,
  name: "dev-token",
  ownerId,
  permissions: [ApiTokenPermission.QUERY],
};

describe("ApiTokensService", () => {
  let service: ApiTokensService;
  let crud: ReturnType<typeof createMockCrud>;
  let tenantCrud: jest.Mock;
  let purgeByOwner: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    tenantCrud = jest.fn().mockReturnValue(crud);
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
        secret: "secret-value",
        tokenId: validId,
      });

    purgeByOwner = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokensService,
        {
          provide: ApiTokensRepository,
          useValue: { purgeByOwner, tenantCrud },
        },
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
      expect(tenantCrud).toHaveBeenCalledWith(ctx);
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
        apiToken: fakeEntity,
        token: `pi_${validId}_secret-value`,
      });

      expect(hash).toHaveBeenCalledWith("secret-value", 8);
      expect(tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.createOne).toHaveBeenCalledWith({
        hashedSecret: "hashed-secret",
        id: validId,
        name: "dev-token",
        permissions: [ApiTokenPermission.QUERY],
      });
    });
  });

  describe("removeOne", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("purgeByOwner", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOwner(ownerId);
      expect(purgeByOwner).toHaveBeenCalledWith(ownerId);
    });
  });
});
