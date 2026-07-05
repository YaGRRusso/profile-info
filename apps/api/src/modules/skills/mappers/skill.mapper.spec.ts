import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { SkillModel } from "../schemas/skill.schema";
import { SkillMapper } from "./skill.mapper";

describe("SkillMapper", () => {
  const mapper = new SkillMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      slug: "typescript",
      i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
      category: "Programming",
      disabled: false,
      partition: CatalogPartition.GLOBAL,
    } as SkillModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      slug: "typescript",
      i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
      category: "Programming",
      disabled: false,
      partition: CatalogPartition.GLOBAL,
      ownerId: undefined,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(mapper.toPersistenceForFilter({ slug: "typescript" })).toEqual({
      slug: "typescript",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ slug: 1 })).toEqual({ slug: 1 });
  });
});
