import mongoose from "mongoose";
import { mockQueryChain } from "@/core/persistence/repositories/query-chain.mock";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
  ownerId: string;
}

describe("TenantScopedStatsRepository", () => {
  let repository: TenantScopedStatsRepository<TestModel>;
  let model: {
    countDocuments: jest.Mock;
    aggregate: jest.Mock;
    find: jest.Mock;
  };

  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const scope = { userId: ownerId, crossTenant: false };

  beforeEach(() => {
    jest.clearAllMocks();

    model = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    repository = new TenantScopedStatsRepository(model as never);
  });

  describe("count", () => {
    it("should scope by ownerId for tenant users", async () => {
      model.countDocuments.mockReturnValue(mockQueryChain(2));

      await expect(repository.count(scope)).resolves.toBe(2);
      expect(model.countDocuments).toHaveBeenCalledWith({ ownerId });
    });

    it("should count all documents for cross-tenant access", async () => {
      model.countDocuments.mockReturnValue(mockQueryChain(5));

      await expect(
        repository.count({ userId: ownerId, crossTenant: true })
      ).resolves.toBe(5);
      expect(model.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe("countByField", () => {
    it("should scope aggregation by ownerId", async () => {
      model.aggregate.mockResolvedValue([{ _id: "COMPLETE", value: 1 }]);

      await expect(repository.countByField(scope, "status")).resolves.toEqual([
        { label: "COMPLETE", value: 1 },
      ]);

      expect(model.aggregate).toHaveBeenCalledWith([
        { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
        { $group: { _id: "$status", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]);
    });
  });

  describe("findRecentlyUpdated", () => {
    it("should scope recent activity by ownerId", async () => {
      const updatedAt = new Date("2026-01-01T00:00:00.000Z");
      const rows = [{ name: "Test", updatedAt }];
      const chain = mockQueryChain(rows);
      model.find.mockReturnValue(chain);

      await expect(
        repository.findRecentlyUpdated(scope, 3, "name updatedAt")
      ).resolves.toEqual(rows);

      expect(model.find).toHaveBeenCalledWith({ ownerId });
      expect(chain.limit).toHaveBeenCalledWith(3);
    });
  });
});
