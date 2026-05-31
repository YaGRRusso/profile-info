import { BadRequestException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import mongoose, { Model } from "mongoose";
import { CourseModel } from "@/schemas/course.schema";
import { CoursesService } from "./courses.service";

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const fakeDoc = {
  _id: validId,
  title: "Full-Stack Bootcamp",
} as unknown as CourseModel;

function makeExec(returnValue: unknown) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("CoursesService", () => {
  let service: CoursesService;
  let model: jest.Mocked<Model<CourseModel>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(CourseModel.name),
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
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    model = module.get(getModelToken(CourseModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("should return the course document", async () => {
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
      const result = await service.createOne({
        title: "Full-Stack Bootcamp",
      } as any);
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
      (model.deleteMany as jest.Mock).mockReturnValue(
        makeExec({ deletedCount: 2 })
      );
      expect(await service.removeMany([validId])).toEqual({ count: 2 });
    });
  });
});
