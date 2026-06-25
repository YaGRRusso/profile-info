import { SkillCategory } from "../enums/category.enum";
import type { SkillModel } from "../schemas/skill.schema";
import { toSkillEntity } from "./skill.mapper";

describe("toSkillEntity", () => {
  it("maps persistence fields to the GraphQL entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 10,
      slug: "typescript",
      name: "TypeScript",
      category: "LANGUAGE",
    } as SkillModel;

    expect(toSkillEntity(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 10,
      slug: "typescript",
      name: "TypeScript",
      category: SkillCategory.LANGUAGE,
    });
  });
});
