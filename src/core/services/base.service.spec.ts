import { BadRequestException, NotFoundException } from "@nestjs/common";
import mongoose, { Model } from "mongoose";
import { BaseService } from "./base.service";

// --- Minimal concrete implementation for testing the abstract class ---

interface FakeDoc {
  _id: string;
  name: string;
}
interface CreateFakeInput {
  name: string;
}
interface UpdateFakeInput {
  name?: string;
}

class FakeService extends BaseService<
  FakeDoc,
  CreateFakeInput,
  UpdateFakeInput
> {
  constructor(model: Model<FakeDoc>) {
    super(model);
  }
}

// --- Helpers ---

const validId = new mongoose.Types.ObjectId().toHexString();
const invalidId = "not-an-object-id";
const fakeDoc = { _id: validId, name: "Fake" } as unknown as FakeDoc;

function makeChain(returnValue: unknown) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

function makeMockModel(): jest.Mocked<Model<FakeDoc>> {
  return {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
  } as unknown as jest.Mocked<Model<FakeDoc>>;
}

describe("BaseService", () => {
  let service: FakeService;
  let model: jest.Mocked<Model<FakeDoc>>;

  beforeEach(() => {
    model = makeMockModel();
    service = new FakeService(model);
  });

  // ------------------------------------------------------------------ //
  // findOneById
  // ------------------------------------------------------------------ //

  describe("findOneById", () => {
    it("should return the document when found", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeChain(fakeDoc));

      const result = await service.findOneById(validId);
      expect(result).toBe(fakeDoc);
      expect(model.findById).toHaveBeenCalledWith(validId);
    });

    it("should throw BadRequestException for an invalid ID", async () => {
      await expect(service.findOneById(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when document is not found", async () => {
      (model.findById as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.findOneById(validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // findOne
  // ------------------------------------------------------------------ //

  describe("findOne", () => {
    it("should return the document matching filters", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeChain(fakeDoc));

      const result = await service.findOne({
        filters: { name: "Fake" } as any,
      });
      expect(result).toBe(fakeDoc);
    });

    it("should throw NotFoundException when no document matches", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.findOne({})).rejects.toThrow(NotFoundException);
    });
  });

  // ------------------------------------------------------------------ //
  // findManyById
  // ------------------------------------------------------------------ //

  describe("findManyById", () => {
    it("should return documents for valid IDs", async () => {
      const id2 = new mongoose.Types.ObjectId().toHexString();
      (model.find as jest.Mock).mockReturnValue(makeChain([fakeDoc]));

      const result = await service.findManyById([validId, id2]);
      expect(result).toEqual([fakeDoc]);
    });

    it("should throw BadRequestException if any ID is invalid", async () => {
      await expect(service.findManyById([validId, invalidId])).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // findMany
  // ------------------------------------------------------------------ //

  describe("findMany", () => {
    it("should return documents with default pagination", async () => {
      const chain = makeChain([fakeDoc]);
      (model.find as jest.Mock).mockReturnValue(chain);

      const result = await service.findMany({});
      expect(result).toEqual([fakeDoc]);
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(50);
    });

    it("should respect custom skip and limit", async () => {
      const chain = makeChain([]);
      (model.find as jest.Mock).mockReturnValue(chain);

      await service.findMany({ skip: 10, limit: 5 });
      expect(chain.skip).toHaveBeenCalledWith(10);
      expect(chain.limit).toHaveBeenCalledWith(5);
    });
  });

  // ------------------------------------------------------------------ //
  // createOne
  // ------------------------------------------------------------------ //

  describe("createOne", () => {
    it("should return the created document", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeDoc);

      const result = await service.createOne({ name: "Fake" });
      expect(result).toBe(fakeDoc);
    });

    it("should throw BadRequestException when create returns null", async () => {
      (model.create as jest.Mock).mockResolvedValue(null);

      await expect(service.createOne({ name: "Fake" })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // createMany
  // ------------------------------------------------------------------ //

  describe("createMany", () => {
    it("should return the created documents", async () => {
      (model.create as jest.Mock).mockResolvedValue([fakeDoc]);

      const result = await service.createMany([{ name: "Fake" }]);
      expect(result).toEqual([fakeDoc]);
    });

    it("should throw BadRequestException when create returns null", async () => {
      (model.create as jest.Mock).mockResolvedValue(null);

      await expect(service.createMany([{ name: "Fake" }])).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // updateOne
  // ------------------------------------------------------------------ //

  describe("updateOne", () => {
    it("should return the updated document", async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue(
        makeChain(fakeDoc)
      );

      const result = await service.updateOne(validId, { name: "Updated" });
      expect(result).toBe(fakeDoc);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(validId, {
        name: "Updated",
      });
    });

    it("should throw BadRequestException for an invalid ID", async () => {
      await expect(service.updateOne(invalidId, {})).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when document is not found", async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.updateOne(validId, {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // updateMany
  // ------------------------------------------------------------------ //

  describe("updateMany", () => {
    it("should return a BatchEntity with the modified count", async () => {
      (model.updateMany as jest.Mock).mockReturnValue(
        makeChain({ modifiedCount: 2 })
      );

      const result = await service.updateMany([validId], { name: "Updated" });
      expect(result).toEqual({ count: 2 });
    });

    it("should throw BadRequestException if any ID is invalid", async () => {
      await expect(
        service.updateMany([validId, invalidId], {})
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when updateMany returns null", async () => {
      (model.updateMany as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.updateMany([validId], {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // removeOne
  // ------------------------------------------------------------------ //

  describe("removeOne", () => {
    it("should return the removed document", async () => {
      (model.findByIdAndDelete as jest.Mock).mockReturnValue(
        makeChain(fakeDoc)
      );

      const result = await service.removeOne(validId);
      expect(result).toBe(fakeDoc);
    });

    it("should throw BadRequestException for an invalid ID", async () => {
      await expect(service.removeOne(invalidId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when document is not found", async () => {
      (model.findByIdAndDelete as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.removeOne(validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ------------------------------------------------------------------ //
  // removeMany
  // ------------------------------------------------------------------ //

  describe("removeMany", () => {
    it("should return a BatchEntity with the deleted count", async () => {
      (model.deleteMany as jest.Mock).mockReturnValue(
        makeChain({ deletedCount: 3 })
      );

      const result = await service.removeMany([validId]);
      expect(result).toEqual({ count: 3 });
    });

    it("should throw BadRequestException if any ID is invalid", async () => {
      await expect(service.removeMany([validId, invalidId])).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when deleteMany returns null", async () => {
      (model.deleteMany as jest.Mock).mockReturnValue(makeChain(null));

      await expect(service.removeMany([validId])).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
