import { BadRequestException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import mongoose, { Model } from "mongoose";
import { UserRole } from "@/core/enums/user-role.enum";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { ExperiencesRepository } from "./experiences.repository";
import { ExperiencesService } from "./experiences.service";

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const ownerId = "507f1f77bcf86cd799439011";
const organizationId = "507f1f77bcf86cd799439012";
const ctx = testAuthContext({ userId: ownerId });
const fakeDoc = {
  _id: validId,
  id: validId,
  ownerId,
  slug: "software-engineer",
  roles: [],
} as unknown as ExperienceModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("ExperiencesService", () => {
  let service: ExperiencesService;
  let model: jest.Mocked<Model<ExperienceModel>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        ExperiencesRepository,
        {
          provide: getModelToken(ExperienceModel.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExperiencesService>(ExperiencesService);
    model = module.get(getModelToken(ExperienceModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
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
      slug: "software-engineer",
      organizationId,
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Software Engineer",
                description: "Backend development",
              },
            },
          ],
        },
      ],
    };

    it("should inject ownerId for regular users", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);

      const result = await service.createOne(ctx, createInput);

      expect(result).toEqual(expect.objectContaining({ id: validId, ownerId }));
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId })
      );
    });

    it("should inject ownerId from context for super admins", async () => {
      const superAdminCtx = testAuthContext({
        role: UserRole.SUPER_ADMIN,
        userId: ownerId,
      });
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);

      await service.createOne(superAdminCtx, createInput);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId })
      );
    });
  });

  describe("updateOne", () => {
    it("should return the updated document", async () => {
      (model.findOneAndUpdate as jest.Mock).mockReturnValue(makeExec(fakeDoc));

      expect(await service.updateOne(ctx, validId, {})).toEqual(
        expect.objectContaining({ id: validId, ownerId })
      );
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId, ownerId },
        {},
        { returnDocument: "after", runValidators: true }
      );
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.updateOne(ctx, invalidId, {})).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeOne", () => {
    it("should return the removed document", async () => {
      (model.findOneAndDelete as jest.Mock).mockReturnValue(makeExec(fakeDoc));

      expect(await service.removeOne(ctx, validId)).toEqual(
        expect.objectContaining({ id: validId, ownerId })
      );
      expect(model.findOneAndDelete).toHaveBeenCalledWith({
        _id: validId,
        ownerId,
      });
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.removeOne(ctx, invalidId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeMany", () => {
    it("should return batch succeeded and failed counts", async () => {
      (model.deleteMany as jest.Mock).mockReturnValue(
        makeExec({ deletedCount: 1 })
      );

      expect(await service.removeMany(ctx, [validId])).toEqual({
        succeeded: 1,
        failed: 0,
      });
      expect(model.deleteMany).toHaveBeenCalledWith({
        _id: { $in: [validId] },
        ownerId,
      });
    });
  });
});
