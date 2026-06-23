import { NotFoundException } from "@nestjs/common";
import mongoose from "mongoose";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { mockQueryChain } from "@/core/persistence/repositories/query-chain.mock";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
  ownerId: string;
}

class TestRepository extends CrudRepository<TestModel> {}

describe("TenantScopedCrudRepository", () => {
  let repository: TestRepository;
  let tenant: TenantScopedCrudRepository<TestModel>;
  let model: {
    findById: jest.Mock;
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

  const fakeDoc = {
    _id: docId,
    ownerId,
    name: "Test",
  } as unknown as TestModel;

  function makeExec(returnValue: unknown) {
    return mockQueryChain(returnValue);
  }

  beforeEach(() => {
    jest.clearAllMocks();

    model = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      findOneAndDelete: jest.fn(),
      deleteMany: jest.fn(),
    };

    repository = new TestRepository(model as never);
    tenant = new TenantScopedCrudRepository(repository);
  });

  describe("findOneById", () => {
    it("should scope by ownerId for tenant users", async () => {
      model.findOne.mockReturnValue(makeExec(fakeDoc));

      await tenant.findOneById({ userId: ownerId, crossTenant: false }, docId);

      expect(model.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: docId, ownerId })
      );
    });

    it("should bypass owner scope for cross-tenant access", async () => {
      model.findById.mockReturnValue(makeExec(fakeDoc));

      await tenant.findOneById({ userId: ownerId, crossTenant: true }, docId);

      expect(model.findById).toHaveBeenCalledWith(docId);
    });

    it("should throw NotFoundException when scoped document is missing", async () => {
      model.findOne.mockReturnValue(makeExec(null));

      await expect(
        tenant.findOneById({ userId: otherOwnerId, crossTenant: false }, docId)
      ).rejects.toThrow(new NotFoundException(PERSISTENCE_NOT_FOUND));
    });
  });

  describe("createOne", () => {
    it("should inject ownerId for tenant users", async () => {
      model.create.mockResolvedValue(fakeDoc);

      await tenant.createOne({ userId: ownerId, crossTenant: false }, {
        name: "Test",
      } as never);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId, name: "Test" })
      );
    });

    it("should ignore ownerId in create input and use scope userId", async () => {
      model.create.mockResolvedValue(fakeDoc);

      await tenant.createOne({ userId: ownerId, crossTenant: false }, {
        name: "Test",
        ownerId: otherOwnerId,
      } as never);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test", ownerId })
      );
    });

    it("should inject ownerId from context on cross-tenant create", async () => {
      model.create.mockResolvedValue(fakeDoc);

      await tenant.createOne({ userId: ownerId, crossTenant: true }, {
        name: "Test",
        ownerId: otherOwnerId,
      } as never);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test", ownerId })
      );
    });
  });

  describe("updateManyById", () => {
    it("should return partial batch counts for tenant scope", async () => {
      model.updateMany.mockReturnValue(makeExec({ matchedCount: 1 }));

      const otherId = new mongoose.Types.ObjectId().toHexString();
      const result = await tenant.updateManyById(
        { userId: ownerId, crossTenant: false },
        [docId, otherId],
        { name: "Updated" }
      );

      expect(model.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId, _id: { $in: [docId, otherId] } }),
        { name: "Updated" },
        expect.objectContaining({ runValidators: true })
      );
      expect(result).toEqual({ succeeded: 1, failed: 1 });
    });
  });

  describe("deleteManyById", () => {
    it("should return partial batch counts for tenant scope", async () => {
      model.deleteMany.mockReturnValue(makeExec({ deletedCount: 1 }));

      const otherId = new mongoose.Types.ObjectId().toHexString();
      const result = await tenant.deleteManyById(
        { userId: ownerId, crossTenant: false },
        [docId, otherId]
      );

      expect(model.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId, _id: { $in: [docId, otherId] } })
      );
      expect(result).toEqual({ succeeded: 1, failed: 1 });
    });
  });
});
