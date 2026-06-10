import { BadRequestException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import mongoose, { type Model } from "mongoose";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { SkillsRepository } from "./skills.repository";
import { SkillsService } from "./skills.service";

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const fakeDoc = {
  _id: validId,
  name: "TypeScript",
  slug: "typescript",
} as unknown as SkillModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("SkillsService", () => {
  let service: SkillsService;
  let model: jest.Mocked<Model<SkillModel>>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        SkillsRepository,
        {
          provide: getModelToken(SkillModel.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
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

    service = module.get<SkillsService>(SkillsService);
    model = module.get(getModelToken(SkillModel.name));
    eventEmitter = module.get(EventEmitter2);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("should return the skill document", async () => {
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
    it("should create and return the document", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);
      const result = await service.createOne({
        name: "TypeScript",
        slug: "typescript",
        category: "LANGUAGE" as any,
      });
      expect(result).toBe(fakeDoc);
    });
  });

  describe("updateOne", () => {
    it("should return the updated document", async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      expect(await service.updateOne(validId, { name: "TS" })).toBe(fakeDoc);
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

    it("should emit skill.deleted before deleting the document", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeExec(fakeDoc));
      (model.findByIdAndDelete as jest.Mock).mockReturnValue(makeExec(fakeDoc));

      await service.removeOne(validId);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(validId)
      );
      expect(model.findByIdAndDelete).toHaveBeenCalled();
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
        makeExec({ deletedCount: 4 })
      );
      expect(await service.removeMany([validId])).toEqual({ count: 4 });
    });

    it("should emit skill.deleted for each skill before deleteMany", async () => {
      (model.find as jest.Mock).mockReturnValue(makeExec([fakeDoc]));
      (model.deleteMany as jest.Mock).mockReturnValue(
        makeExec({ deletedCount: 1 })
      );

      await service.removeMany([validId]);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(validId)
      );
      expect(model.deleteMany).toHaveBeenCalled();
    });
  });
});
