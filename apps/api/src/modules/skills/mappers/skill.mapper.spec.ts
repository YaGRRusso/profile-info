import { SkillCategory } from "../enums/category.enum";
import type { SkillModel } from "../schemas/skill.schema";
import { SkillMapper } from "./skill.mapper";

describe("SkillMapper", () => {
  const mapper = new SkillMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 10,
      slug: "typescript",
      name: "TypeScript",
      category: "LANGUAGE",
      disabled: false,
    } as SkillModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 10,
      slug: "typescript",
      name: "TypeScript",
      category: SkillCategory.LANGUAGE,
      disabled: false,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(mapper.toPersistenceForFilter({ name: "TypeScript" })).toEqual({
      name: "TypeScript",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ name: 1 })).toEqual({ name: 1 });
  });
});
