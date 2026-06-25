import { BadRequestException, NotFoundException } from "@nestjs/common";
import mongoose from "mongoose";
import { MAX_PAGE_SIZE } from "@/core/persistence/consts/limits.const";
import {
  PERSISTENCE_NOT_CREATED,
  PERSISTENCE_NOT_FOUND,
  PERSISTENCE_NOT_REMOVED,
  PERSISTENCE_NOT_UPDATED,
} from "@/core/persistence/persistence.messages";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { mockQueryChain } from "@/core/persistence/repositories/query-chain.mock";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
}

describe("CrudRepository", () => {
  let repository: CrudRepository<TestModel, TestModel>;
  let model: {
    findById: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    countDocuments: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findOneAndUpdate: jest.Mock;
    updateMany: jest.Mock;
    findByIdAndDelete: jest.Mock;
    findOneAndDelete: jest.Mock;
    deleteMany: jest.Mock;
  };

  const docId = new mongoose.Types.ObjectId().toHexString();
  const fakeDoc = { _id: docId, name: "Test" } as unknown as TestModel;

  beforeEach(() => {
    jest.clearAllMocks();

    model = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndDelete: jest.fn(),
      deleteMany: jest.fn(),
    };

    repository = new CrudRepository(model as never, (doc) => doc);
  });

  describe("findOneById", () => {
    it("should return the document when found", async () => {
      model.findById.mockReturnValue(mockQueryChain(fakeDoc));

      await expect(repository.findOneById(docId)).resolves.toBe(fakeDoc);
    });

    it("should throw NotFoundException when missing", async () => {
      model.findById.mockReturnValue(mockQueryChain(null));

      await expect(repository.findOneById(docId)).rejects.toThrow(
        new NotFoundException(PERSISTENCE_NOT_FOUND)
      );
    });

    it("should reject invalid object ids", async () => {
      await expect(repository.findOneById("invalid")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("findManyById", () => {
    it("should return an empty array for empty input", async () => {
      await expect(repository.findManyById([])).resolves.toEqual([]);
      expect(model.find).not.toHaveBeenCalled();
    });

    it("should query by id list", async () => {
      model.find.mockReturnValue({
        limit: jest.fn().mockReturnValue(mockQueryChain([fakeDoc])),
      });

      await repository.findManyById([docId]);

      expect(model.find).toHaveBeenCalledWith({ _id: { $in: [docId] } });
    });
  });

  describe("findMany", () => {
    it("should cap limit at MAX_PAGE_SIZE", async () => {
      const limit = jest.fn().mockReturnValue(mockQueryChain([]));
      model.find.mockReturnValue({
        sort: jest
          .fn()
          .mockReturnValue({ skip: jest.fn().mockReturnValue({ limit }) }),
      });
      model.countDocuments.mockReturnValue(mockQueryChain(0));

      await repository.findMany({ limit: 500 });

      expect(limit).toHaveBeenCalledWith(MAX_PAGE_SIZE);
    });

    it("should return nodes and found in parallel", async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue(mockQueryChain([fakeDoc])),
          }),
        }),
      });
      model.countDocuments.mockReturnValue(mockQueryChain(1));

      await expect(repository.findMany({})).resolves.toEqual({
        nodes: [fakeDoc],
        found: 1,
      });
    });
  });

  describe("createMany", () => {
    it("should return zero counts for empty input", async () => {
      await expect(repository.createMany([])).resolves.toEqual({
        succeeded: 0,
        failed: 0,
      });
    });

    it("should return batch counts on success", async () => {
      model.create.mockResolvedValue([fakeDoc, fakeDoc]);

      await expect(
        repository.createMany([{ name: "A" }, { name: "B" }] as never)
      ).resolves.toEqual({ succeeded: 2, failed: 0 });
    });

    it("should throw when nothing is created", async () => {
      model.create.mockResolvedValue([]);

      await expect(
        repository.createMany([{ name: "A" }] as never)
      ).rejects.toThrow(new BadRequestException(PERSISTENCE_NOT_CREATED));
    });
  });

  describe("updateManyById", () => {
    it("should return partial batch counts", async () => {
      const otherId = new mongoose.Types.ObjectId().toHexString();
      model.updateMany.mockReturnValue(mockQueryChain({ matchedCount: 1 }));

      await expect(
        repository.updateManyById([docId, otherId], { name: "Updated" })
      ).resolves.toEqual({ succeeded: 1, failed: 1 });
    });

    it("should throw when no documents match", async () => {
      model.updateMany.mockReturnValue(mockQueryChain({ matchedCount: 0 }));

      await expect(
        repository.updateManyById([docId], { name: "Updated" })
      ).rejects.toThrow(new NotFoundException(PERSISTENCE_NOT_UPDATED));
    });
  });

  describe("updateMany", () => {
    it("should forward arrayFilters to mongoose", async () => {
      model.updateMany.mockReturnValue(mockQueryChain({ matchedCount: 2 }));

      await repository.updateMany(
        { name: "Test" },
        { $set: { name: "Updated" } },
        { arrayFilters: [{ "elem.name": "Test" }] }
      );

      expect(model.updateMany).toHaveBeenCalledWith(
        { name: "Test" },
        { $set: { name: "Updated" } },
        expect.objectContaining({
          arrayFilters: [{ "elem.name": "Test" }],
          runValidators: true,
        })
      );
    });
  });

  describe("deleteManyById", () => {
    it("should return partial batch counts", async () => {
      const otherId = new mongoose.Types.ObjectId().toHexString();
      model.deleteMany.mockReturnValue(mockQueryChain({ deletedCount: 1 }));

      await expect(
        repository.deleteManyById([docId, otherId])
      ).resolves.toEqual({ succeeded: 1, failed: 1 });
    });

    it("should throw when nothing is deleted", async () => {
      model.deleteMany.mockReturnValue(mockQueryChain({ deletedCount: 0 }));

      await expect(repository.deleteManyById([docId])).rejects.toThrow(
        new NotFoundException(PERSISTENCE_NOT_REMOVED)
      );
    });
  });

  describe("updateOneById", () => {
    it("should use runValidators and return the updated document", async () => {
      model.findByIdAndUpdate.mockReturnValue(mockQueryChain(fakeDoc));

      await repository.updateOneById(docId, { name: "Updated" });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        docId,
        { name: "Updated" },
        { returnDocument: "after", runValidators: true }
      );
    });
  });

  describe("deleteOne", () => {
    it("should throw when filter matches nothing", async () => {
      model.findOneAndDelete.mockReturnValue(mockQueryChain(null));

      await expect(
        repository.deleteOne({ filters: { name: "Missing" } })
      ).rejects.toThrow(new NotFoundException(PERSISTENCE_NOT_REMOVED));
    });
  });
});
