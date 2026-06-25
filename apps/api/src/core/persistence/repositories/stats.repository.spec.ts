import { mockQueryChain } from "@/core/persistence/repositories/query-chain.mock";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { BaseModel } from "@/core/schemas/base.schema";

interface TestModel extends BaseModel {
  name: string;
}

describe("StatsRepository", () => {
  let repository: StatsRepository<TestModel>;
  let model: {
    countDocuments: jest.Mock;
    aggregate: jest.Mock;
    find: jest.Mock;
  };

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
  });
});
