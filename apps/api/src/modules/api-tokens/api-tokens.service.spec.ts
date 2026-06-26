import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import {
  testApiTokenAuthContext,
  testAuthContext,
} from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import mongoose, { Model } from "mongoose";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { ApiTokensRepository } from "./api-tokens.repository";
import { ApiTokensService } from "./api-tokens.service";
import { emitApiToken } from "./helpers/api-token-secret.helper";
import { ApiTokenModel } from "./schemas/api-token.schema";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-secret"),
}));

jest.mock("./helpers/api-token-secret.helper", () => ({
  emitApiToken: jest.fn(),
}));

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const ownerId = "507f1f77bcf86cd799439011";
const ctx = testAuthContext({ userId: ownerId });
const apiTokenCtx = testApiTokenAuthContext([ApiTokenPermission.QUERY], {
  userId: ownerId,
});

const fakeDoc = {
  _id: validId,
  id: validId,
  ownerId,
  name: "dev-token",
  hashedSecret: "hashed-secret",
  permissions: [ApiTokenPermission.QUERY],
} as unknown as ApiTokenModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("ApiTokensService", () => {
  let service: ApiTokensService;
  let model: jest.Mocked<Model<ApiTokenModel>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mocked(emitApiToken).mockReturnValue({
      plaintext: `pi_${validId}_secret-value`,
      tokenId: validId,
      secret: "secret-value",
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokensService,
        ApiTokensRepository,
        {
          provide: getModelToken(ApiTokenModel.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteMany: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiTokensService>(ApiTokensService);
    model = module.get(getModelToken(ApiTokenModel.name));
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
    it("should scope by ownerId", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeDoc));

      expect(await service.findOneById(ctx, validId)).toEqual(
        expect.objectContaining({ id: validId, ownerId })
      );
      expect(model.findOne).toHaveBeenCalledWith({
        _id: validId,
        ownerId,
      });
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.findOneById(ctx, invalidId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when not found", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(null));
      await expect(service.findOneById(ctx, validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("createOne", () => {
    const createInput = {
      name: "dev-token",
      permissions: [ApiTokenPermission.QUERY],
    };

    it("should hash secret, inject ownerId, and return plaintext token", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);

      const result = await service.createOne(ctx, createInput);

      expect(result).toEqual({
        token: `pi_${validId}_secret-value`,
        apiToken: expect.objectContaining({
          id: validId,
          ownerId,
          name: "dev-token",
        }),
      });
      expect(emitApiToken).toHaveBeenCalled();
      expect(hash).toHaveBeenCalledWith("secret-value", 8);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId,
          name: "dev-token",
          hashedSecret: "hashed-secret",
          permissions: [ApiTokenPermission.QUERY],
        })
      );
    });
  });

  describe("removeOne", () => {
    it("should scope delete by ownerId", async () => {
      (model.findOneAndDelete as jest.Mock).mockReturnValue(makeExec(fakeDoc));

      expect(await service.removeOne(ctx, validId)).toEqual(
        expect.objectContaining({ id: validId, ownerId })
      );
      expect(model.findOneAndDelete).toHaveBeenCalledWith({
        _id: validId,
        ownerId,
      });
    });
  });
});
