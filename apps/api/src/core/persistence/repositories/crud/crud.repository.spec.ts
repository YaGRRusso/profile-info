import { BadRequestException, NotFoundException } from "@nestjs/common";
import mongoose from "mongoose";
import { i18nKey } from "@/core/i18n/i18n";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/core/persistence/consts/limits.const";
import { tenantScope } from "@/core/persistence/helpers/tenant-scope.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { createPassThroughMapper } from "@/core/persistence/repositories/testing/repository-spec.helper";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
  ownerId?: string;
  relevance?: number;
}

function mockExecChain(returnValue: unknown) {
  return {
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

function mockQueryChain(returnValue: unknown) {
  const chain = {
    exec: jest.fn().mockResolvedValue(returnValue),
    lean: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    skip: jest.fn(),
    sort: jest.fn(),
  };

  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);

  return chain;
}

function mockFindManyChain(nodes: unknown[]) {
  return {
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue(mockQueryChain(nodes)),
      }),
    }),
  };
}

function mockFindByIdChain(nodes: unknown[]) {
  return {
    limit: jest.fn().mockReturnValue(mockQueryChain(nodes)),
  };
}

describe("CrudRepository", () => {
  let repository: CrudRepository<TestModel, TestModel>;
  let mapper: CrudMapperInterface<TestModel, TestModel>;
  let model: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    countDocuments: jest.Mock;
    findOneAndUpdate: jest.Mock;
    updateMany: jest.Mock;
    findOneAndDelete: jest.Mock;
    deleteMany: jest.Mock;
  };

  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const otherOwnerId = new mongoose.Types.ObjectId().toHexString();
  const docId = new mongoose.Types.ObjectId().toHexString();
  const fakeDoc = { _id: docId, name: "Test", ownerId } as unknown as TestModel;
  const tenant = { crossTenant: false, userId: ownerId };

  beforeEach(() => {
    jest.clearAllMocks();

    model = {
      countDocuments: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
    };

    mapper = createPassThroughMapper<TestModel>();
    repository = new CrudRepository(model as never, mapper);
  });

  describe("findOne", () => {
    it("should resolve domain filters and return the document", async () => {
      model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

      await expect(
        repository.findOne({ filters: { name: "Test" } })
      ).resolves.toBe(fakeDoc);

      expect(model.findOne).toHaveBeenCalledWith({ name: "Test" });
    });

    it("should throw NotFoundException when missing", async () => {
      model.findOne.mockReturnValue(mockQueryChain(null));

      await expect(
        repository.findOne({ filters: { name: "Missing" } })
      ).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );
    });
  });

  describe("findOneById", () => {
    it("should return the document when found", async () => {
      model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

      await expect(repository.findOneById(docId)).resolves.toBe(fakeDoc);
      expect(model.findOne).toHaveBeenCalledWith({ _id: docId });
    });

    it("should throw NotFoundException when missing", async () => {
      model.findOne.mockReturnValue(mockQueryChain(null));

      await expect(repository.findOneById(docId)).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
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
      model.find.mockReturnValue(mockFindByIdChain([fakeDoc]));

      await expect(repository.findManyById([docId])).resolves.toEqual([
        fakeDoc,
      ]);
      expect(model.find).toHaveBeenCalledWith({ _id: { $in: [docId] } });
    });
  });

  describe("findMany", () => {
    it("should default limit to DEFAULT_PAGE_SIZE", async () => {
      const limit = jest.fn().mockReturnValue(mockQueryChain([]));
      model.find.mockReturnValue({
        sort: jest
          .fn()
          .mockReturnValue({ skip: jest.fn().mockReturnValue({ limit }) }),
      });
      model.countDocuments.mockReturnValue(mockQueryChain(0));

      await repository.findMany({});

      expect(limit).toHaveBeenCalledWith(DEFAULT_PAGE_SIZE);
    });

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
      model.find.mockReturnValue(mockFindManyChain([fakeDoc]));
      model.countDocuments.mockReturnValue(mockQueryChain(1));

      await expect(repository.findMany({})).resolves.toEqual({
        found: 1,
        nodes: [fakeDoc],
      });
    });

    it("should map domain filters and sort through the mapper", async () => {
      mapper.toPersistenceForFilter = jest
        .fn()
        .mockReturnValue({ name: "Test" });
      mapper.toPersistenceForSort = jest.fn().mockReturnValue({ relevance: 1 });
      model.find.mockReturnValue(mockFindManyChain([fakeDoc]));
      model.countDocuments.mockReturnValue(mockQueryChain(1));

      await repository.findMany({
        filters: { name: "Test" },
        skip: 10,
        sort: { relevance: 1 },
      });

      expect(mapper.toPersistenceForFilter).toHaveBeenCalledWith({
        name: "Test",
      });
      expect(mapper.toPersistenceForSort).toHaveBeenCalledWith({
        relevance: 1,
      });
      expect(model.find).toHaveBeenCalledWith({ name: "Test" });
    });
  });

  describe("createOne", () => {
    it("should create and map the document", async () => {
      model.create.mockResolvedValue(fakeDoc);

      await expect(
        repository.createOne({ name: "Test" } as never)
      ).resolves.toBe(fakeDoc);

      expect(model.create).toHaveBeenCalledWith({ name: "Test" });
    });
  });

  describe("createMany", () => {
    it("should return zero counts for empty input", async () => {
      await expect(repository.createMany([])).resolves.toEqual({
        failed: 0,
        succeeded: 0,
      });
    });

    it("should return batch counts on success", async () => {
      model.create.mockResolvedValue([fakeDoc, fakeDoc]);

      await expect(
        repository.createMany([{ name: "A" }, { name: "B" }] as never)
      ).resolves.toEqual({ failed: 0, succeeded: 2 });
    });

    it("should throw when nothing is created", async () => {
      model.create.mockResolvedValue([]);

      await expect(
        repository.createMany([{ name: "A" }] as never)
      ).rejects.toThrow(
        new BadRequestException(i18nKey("persistence.NOT_CREATED"))
      );
    });
  });

  describe("updateOne", () => {
    it("should resolve filters and return the updated document", async () => {
      model.findOneAndUpdate.mockReturnValue(mockQueryChain(fakeDoc));

      await expect(
        repository.updateOne({ filters: { name: "Test" } }, { name: "Updated" })
      ).resolves.toBe(fakeDoc);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { name: "Test" },
        { name: "Updated" },
        { returnDocument: "after", runValidators: true }
      );
    });
  });

  describe("updateMany", () => {
    it("should resolve domain filters and forward arrayFilters", async () => {
      model.updateMany.mockReturnValue(mockExecChain({ matchedCount: 2 }));

      await repository.updateMany(
        { name: "Test" },
        { name: "Updated" },
        { arrayFilters: [{ "elem.name": "Test" }] }
      );

      expect(model.updateMany).toHaveBeenCalledWith(
        { name: "Test" },
        { name: "Updated" },
        expect.objectContaining({
          arrayFilters: [{ "elem.name": "Test" }],
          runValidators: true,
        })
      );
    });
  });

  describe("updateManyById", () => {
    it("should return partial batch counts", async () => {
      const otherId = new mongoose.Types.ObjectId().toHexString();
      model.updateMany.mockReturnValue(mockExecChain({ matchedCount: 1 }));

      await expect(
        repository.updateManyById([docId, otherId], { name: "Updated" })
      ).resolves.toEqual({ failed: 1, succeeded: 1 });
    });

    it("should throw when no documents match", async () => {
      model.updateMany.mockReturnValue(mockExecChain({ matchedCount: 0 }));

      await expect(
        repository.updateManyById([docId], { name: "Updated" })
      ).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_UPDATED"))
      );
    });
  });

  describe("updateOneById", () => {
    it("should use runValidators and return the updated document", async () => {
      model.findOneAndUpdate.mockReturnValue(mockQueryChain(fakeDoc));

      await repository.updateOneById(docId, { name: "Updated" });

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: docId },
        { name: "Updated" },
        { returnDocument: "after", runValidators: true }
      );
    });
  });

  describe("deleteOne", () => {
    it("should resolve filters and return the deleted document", async () => {
      model.findOneAndDelete.mockReturnValue(mockQueryChain(fakeDoc));

      await expect(
        repository.deleteOne({ filters: { name: "Test" } })
      ).resolves.toBe(fakeDoc);

      expect(model.findOneAndDelete).toHaveBeenCalledWith({ name: "Test" });
    });

    it("should throw when filter matches nothing", async () => {
      model.findOneAndDelete.mockReturnValue(mockQueryChain(null));

      await expect(
        repository.deleteOne({ filters: { name: "Missing" } })
      ).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_REMOVED"))
      );
    });
  });

  describe("deleteMany", () => {
    it("should resolve domain filters before deleting", async () => {
      model.deleteMany.mockReturnValue(mockExecChain({ deletedCount: 2 }));

      await repository.deleteMany({ name: "Test" });

      expect(model.deleteMany).toHaveBeenCalledWith({ name: "Test" });
    });
  });

  describe("deleteManyById", () => {
    it("should return partial batch counts", async () => {
      const otherId = new mongoose.Types.ObjectId().toHexString();
      model.deleteMany.mockReturnValue(mockExecChain({ deletedCount: 1 }));

      await expect(
        repository.deleteManyById([docId, otherId])
      ).resolves.toEqual({ failed: 1, succeeded: 1 });
    });

    it("should throw when nothing is deleted", async () => {
      model.deleteMany.mockReturnValue(mockExecChain({ deletedCount: 0 }));

      await expect(repository.deleteManyById([docId])).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_REMOVED"))
      );
    });
  });

  describe("scoped", () => {
    it("should return a new repository instance", () => {
      const scoped = repository.scoped(tenantScope(tenant));
      expect(scoped).not.toBe(repository);
      expect(scoped).toBeInstanceOf(CrudRepository);
    });

    describe("findOne", () => {
      it("should scope resolved filters by ownerId", async () => {
        model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

        await repository
          .scoped(tenantScope(tenant))
          .findOne({ filters: { name: "Test" } });

        expect(model.findOne).toHaveBeenCalledWith({
          name: "Test",
          ownerId,
        });
      });
    });

    describe("findOneById", () => {
      it("should scope by ownerId for tenant users", async () => {
        model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

        await repository.scoped(tenantScope(tenant)).findOneById(docId);

        expect(model.findOne).toHaveBeenCalledWith(
          expect.objectContaining({ _id: docId, ownerId })
        );
      });

      it("should bypass owner scope for cross-tenant access", async () => {
        model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

        await repository
          .scoped(tenantScope({ crossTenant: true, userId: ownerId }))
          .findOneById(docId);

        expect(model.findOne).toHaveBeenCalledWith({ _id: docId });
      });

      it("should throw NotFoundException when scoped document is missing", async () => {
        model.findOne.mockReturnValue(mockQueryChain(null));

        await expect(
          repository
            .scoped(tenantScope({ crossTenant: false, userId: otherOwnerId }))
            .findOneById(docId)
        ).rejects.toThrow(
          new NotFoundException(i18nKey("persistence.NOT_FOUND"))
        );
      });
    });

    describe("findMany", () => {
      it("should scope resolved filters for count and find", async () => {
        model.find.mockReturnValue(mockFindManyChain([fakeDoc]));
        model.countDocuments.mockReturnValue(mockQueryChain(1));

        await repository
          .scoped(tenantScope(tenant))
          .findMany({ filters: { name: "Test" } });

        expect(model.find).toHaveBeenCalledWith({ name: "Test", ownerId });
        expect(model.countDocuments).toHaveBeenCalledWith({
          name: "Test",
          ownerId,
        });
      });
    });

    describe("createOne", () => {
      it("should inject ownerId for tenant users", async () => {
        model.create.mockResolvedValue(fakeDoc);

        await repository
          .scoped(tenantScope(tenant))
          .createOne({ name: "Test" } as never);

        expect(model.create).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Test", ownerId })
        );
      });

      it("should ignore ownerId in create input and use scope userId", async () => {
        model.create.mockResolvedValue(fakeDoc);

        await repository.scoped(tenantScope(tenant)).createOne({
          name: "Test",
          ownerId: otherOwnerId,
        } as never);

        expect(model.create).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Test", ownerId })
        );
      });

      it("should inject ownerId from context on cross-tenant create", async () => {
        model.create.mockResolvedValue(fakeDoc);

        await repository
          .scoped(tenantScope({ crossTenant: true, userId: ownerId }))
          .createOne({ name: "Test", ownerId: otherOwnerId } as never);

        expect(model.create).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Test", ownerId })
        );
      });
    });

    describe("updateManyById", () => {
      it("should return partial batch counts for tenant scope", async () => {
        model.updateMany.mockReturnValue(mockExecChain({ matchedCount: 1 }));

        const otherId = new mongoose.Types.ObjectId().toHexString();
        const result = await repository
          .scoped(tenantScope(tenant))
          .updateManyById([docId, otherId], { name: "Updated" });

        expect(model.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({ _id: { $in: [docId, otherId] }, ownerId }),
          { name: "Updated" },
          expect.objectContaining({ runValidators: true })
        );
        expect(result).toEqual({ failed: 1, succeeded: 1 });
      });
    });

    describe("deleteManyById", () => {
      it("should return partial batch counts for tenant scope", async () => {
        model.deleteMany.mockReturnValue(mockExecChain({ deletedCount: 1 }));

        const otherId = new mongoose.Types.ObjectId().toHexString();
        const result = await repository
          .scoped(tenantScope(tenant))
          .deleteManyById([docId, otherId]);

        expect(model.deleteMany).toHaveBeenCalledWith(
          expect.objectContaining({ _id: { $in: [docId, otherId] }, ownerId })
        );
        expect(result).toEqual({ failed: 1, succeeded: 1 });
      });
    });
  });

  describe("global", () => {
    it("should return an unscoped repository instance", async () => {
      model.findOne.mockReturnValue(mockQueryChain(fakeDoc));

      await repository.global().findOneById(docId);

      expect(model.findOne).toHaveBeenCalledWith({ _id: docId });
    });
  });
});
