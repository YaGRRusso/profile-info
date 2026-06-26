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
  id: validId,
  name: "Acme Corp",
  slug: "acme-corp",
  category: "COMPANY",
  i18n: [],
} as unknown as OrganizationModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

function makeFindManyChain(nodes: unknown[]) {
  return {
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue(makeExec(nodes)),
      }),
    }),
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
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            updateMany: jest.fn(),
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
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.findOneById(validId)).toEqual(
        expect.objectContaining({ id: validId, name: "Acme Corp" })
      );
      expect(model.findOne).toHaveBeenCalledWith({ _id: validId });
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.findOneById(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when not found", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(null));
      await expect(service.findOneById(validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("createOne", () => {
    it("should return the created document", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);
      const result = await service.createOne({ name: "Acme Corp" } as never);
      expect(result).toEqual(
        expect.objectContaining({ id: validId, name: "Acme Corp" })
      );
    });
  });

  describe("updateOne", () => {
    it("should return the updated document", async () => {
      (model.findOneAndUpdate as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.updateOne(validId, {})).toEqual(
        expect.objectContaining({ id: validId, name: "Acme Corp" })
      );
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        {},
        { returnDocument: "after", runValidators: true }
      );
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.updateOne(invalidId, {})).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeOne", () => {
    it("should return the removed document", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      (model.findOneAndDelete as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.removeOne(validId)).toEqual(
        expect.objectContaining({ id: validId, name: "Acme Corp" })
      );
    });

    it("should throw BadRequestException for invalid ID", async () => {
      await expect(service.removeOne(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("removeMany", () => {
    it("should return batch succeeded and failed counts", async () => {
      (model.find as jest.Mock).mockReturnValue(
        makeFindManyChain([fakeDoc]) as never
      );
      (model.countDocuments as jest.Mock).mockReturnValue(makeExec(1) as never);
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
