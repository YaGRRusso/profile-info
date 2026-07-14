import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { SkillModel } from "../schemas/skill.schema";
import { SkillMapper } from "./skill.mapper";

describe("SkillMapper", () => {
  const mapper = new SkillMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      category: "Programming",
      createdAt: new Date("2024-01-01"),
      disabled: false,
      i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
      id: "507f1f77bcf86cd799439011",
      partition: CatalogPartition.GLOBAL,
      slug: "typescript",
      updatedAt: new Date("2024-01-02"),
    } as SkillModel;

    expect(mapper.toDomain(model)).toEqual({
      category: "Programming",
      createdAt: model.createdAt,
      disabled: false,
      i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
      id: "507f1f77bcf86cd799439011",
      ownerId: "",
      partition: CatalogPartition.GLOBAL,
      slug: "typescript",
      updatedAt: model.updatedAt,
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
