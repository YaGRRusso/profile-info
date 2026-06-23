import { BadRequestException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import mongoose, { Model } from "mongoose";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { OrganizationsRepository } from "./organizations.repository";
import { OrganizationsService } from "./organizations.service";

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const fakeDoc = {
  _id: validId,
  name: "Acme Corp",
} as unknown as OrganizationModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("OrganizationsService", () => {
  let service: OrganizationsService;
  let model: jest.Mocked<Model<OrganizationModel>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        OrganizationsRepository,
        {
          provide: getModelToken(OrganizationModel.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            findByIdAndDelete: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    model = module.get(getModelToken(OrganizationModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("should return the organization document", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.findOneById(validId)).toBe(fakeDoc);
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.findOneById(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when not found", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeExec(null));
      await expect(service.findOneById(validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("createOne", () => {
    it("should return the created document", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);
      const result = await service.createOne({ name: "Acme Corp" } as any);
      expect(result).toBe(fakeDoc);
    });
  });

  describe("updateOne", () => {
    it("should return the updated document", async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.updateOne(validId, {})).toBe(fakeDoc);
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.updateOne(invalidId, {})).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeOne", () => {
    it("should return the removed document", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      (model.findByIdAndDelete as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.removeOne(validId)).toBe(fakeDoc);
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.removeOne(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeMany", () => {
    it("should return a BatchEntity count", async () => {
      (model.find as jest.Mock).mockReturnValue(makeExec([fakeDoc]));
      (model.deleteMany as jest.Mock).mockReturnValue(
        makeExec({ deletedCount: 1 })
      );
      expect(await service.removeMany([validId])).toEqual({
        succeeded: 1,
        failed: 0,
      });
    });
  });
});
