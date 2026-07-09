import mongoose from "mongoose";
import { tenantScope } from "@/core/persistence/helpers/tenant-scope.helper";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
  ownerId: string;
}

function mockQueryChain(returnValue: unknown) {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };

  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);

  return chain;
}

describe("StatsRepository", () => {
  let repository: StatsRepository<TestModel>;
  let model: {
    countDocuments: jest.Mock;
    aggregate: jest.Mock;
    find: jest.Mock;
  };

  const ownerId = new mongoose.Types.ObjectId().toHexString();
  const tenant = { userId: ownerId, crossTenant: false };

  beforeEach(() => {
    jest.clearAllMocks();

    model = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    repository = new StatsRepository(model as never);
  });

  describe("count", () => {
    it("should return total document count", async () => {
      model.countDocuments.mockReturnValue(mockQueryChain(42));

      await expect(repository.count()).resolves.toBe(42);
      expect(model.countDocuments).toHaveBeenCalledWith({});
    });

    it("should resolve filters before counting", async () => {
      model.countDocuments.mockReturnValue(mockQueryChain(3));

      await expect(repository.count({ name: "TypeScript" })).resolves.toBe(3);
      expect(model.countDocuments).toHaveBeenCalledWith({ name: "TypeScript" });
    });
  });

  describe("countByField", () => {
    it("should map aggregation rows to label/value pairs", async () => {
      model.aggregate.mockResolvedValue([
        { _id: "typescript", value: 3 },
        { _id: "nestjs", value: 1 },
      ]);

      await expect(repository.countByField("name")).resolves.toEqual([
        { label: "typescript", value: 3 },
        { label: "nestjs", value: 1 },
      ]);

      expect(model.aggregate).toHaveBeenCalledWith([
        { $group: { _id: "$name", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]);
    });

    it("should resolve match filters before aggregating", async () => {
      model.aggregate.mockResolvedValue([{ _id: "COMPLETE", value: 2 }]);

      await repository.countByField("status", { name: "TypeScript" });

      expect(model.aggregate).toHaveBeenCalledWith([
        { $match: { name: "TypeScript" } },
        { $group: { _id: "$status", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]);
    });
  });

  describe("findRecentlyUpdated", () => {
    it("should query with sort, limit, projection, and lean", async () => {
      const updatedAt = new Date("2026-01-01T00:00:00.000Z");
      const rows = [{ name: "Test", updatedAt }];
      const chain = mockQueryChain(rows);
      model.find.mockReturnValue(chain);

      await expect(
        repository.findRecentlyUpdated(5, "name updatedAt")
      ).resolves.toEqual(rows);

      expect(model.find).toHaveBeenCalledWith({});
      expect(chain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(chain.select).toHaveBeenCalledWith("name updatedAt");
      expect(chain.lean).toHaveBeenCalled();
    });

    it("should resolve filters before querying", async () => {
      const chain = mockQueryChain([]);
      model.find.mockReturnValue(chain);

      await repository.findRecentlyUpdated(5, "name updatedAt", {
        name: "TypeScript",
      });

      expect(model.find).toHaveBeenCalledWith({ name: "TypeScript" });
    });
  });

  describe("scoped", () => {
    let scoped: StatsRepository<TestModel>;

    beforeEach(() => {
      scoped = repository.scoped(tenantScope(tenant));
    });

    it("should return a new repository instance", () => {
      expect(scoped).not.toBe(repository);
      expect(scoped).toBeInstanceOf(StatsRepository);
    });

    describe("count", () => {
      it("should scope by ownerId for tenant users", async () => {
        model.countDocuments.mockReturnValue(mockQueryChain(2));

        await expect(scoped.count()).resolves.toBe(2);
        expect(model.countDocuments).toHaveBeenCalledWith({ ownerId });
      });

      it("should scope resolved filters by ownerId", async () => {
        model.countDocuments.mockReturnValue(mockQueryChain(1));

        await scoped.count({ name: "TypeScript" });

        expect(model.countDocuments).toHaveBeenCalledWith({
          name: "TypeScript",
          ownerId,
        });
      });

      it("should count all documents for cross-tenant access", async () => {
        model.countDocuments.mockReturnValue(mockQueryChain(5));

        await expect(
          repository
            .scoped(tenantScope({ userId: ownerId, crossTenant: true }))
            .count({
              name: "TypeScript",
            })
        ).resolves.toBe(5);

        expect(model.countDocuments).toHaveBeenCalledWith({
          name: "TypeScript",
        });
      });
    });

    describe("countByField", () => {
      it("should scope aggregation by ownerId", async () => {
        model.aggregate.mockResolvedValue([{ _id: "COMPLETE", value: 1 }]);

        await expect(scoped.countByField("status")).resolves.toEqual([
          { label: "COMPLETE", value: 1 },
        ]);

        expect(model.aggregate).toHaveBeenCalledWith([
          { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
          { $group: { _id: "$status", value: { $sum: 1 } } },
          { $sort: { value: -1 } },
        ]);
      });

      it("should scope resolved match filters for aggregation", async () => {
        model.aggregate.mockResolvedValue([{ _id: "COMPLETE", value: 1 }]);

        await scoped.countByField("status", { name: "TypeScript" });

        expect(model.aggregate).toHaveBeenCalledWith([
          {
            $match: {
              name: "TypeScript",
              ownerId: new mongoose.Types.ObjectId(ownerId),
            },
          },
          { $group: { _id: "$status", value: { $sum: 1 } } },
          { $sort: { value: -1 } },
        ]);
      });

      it("should not scope aggregation by ownerId for cross-tenant access", async () => {
        model.aggregate.mockResolvedValue([{ _id: "FULL_TIME", value: 2 }]);

        await expect(
          repository
            .scoped(tenantScope({ userId: ownerId, crossTenant: true }))
            .countByField("category")
        ).resolves.toEqual([{ label: "FULL_TIME", value: 2 }]);

        expect(model.aggregate).toHaveBeenCalledWith([
          { $group: { _id: "$category", value: { $sum: 1 } } },
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
          scoped.findRecentlyUpdated(3, "name updatedAt")
        ).resolves.toEqual(rows);

        expect(model.find).toHaveBeenCalledWith({ ownerId });
        expect(chain.limit).toHaveBeenCalledWith(3);
      });

      it("should scope resolved filters for recent activity", async () => {
        const chain = mockQueryChain([]);
        model.find.mockReturnValue(chain);

        await scoped.findRecentlyUpdated(3, "name updatedAt", {
          name: "TypeScript",
        });

        expect(model.find).toHaveBeenCalledWith({
          name: "TypeScript",
          ownerId,
        });
      });
    });
  });

  describe("global", () => {
    it("should return an unscoped repository instance", async () => {
      model.countDocuments.mockReturnValue(mockQueryChain(7));

      await repository.global().count({ name: "TypeScript" });

      expect(model.countDocuments).toHaveBeenCalledWith({ name: "TypeScript" });
    });
  });
});
