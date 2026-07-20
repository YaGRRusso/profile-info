import mongoose from "mongoose";
import { ExperienceCategory } from "../enums/category.enum";
import type { ExperienceModel } from "../schemas/experience.schema";
import { ExperienceMapper } from "./experience.mapper";

describe("ExperienceMapper", () => {
  const mapper = new ExperienceMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const organizationId = "507f1f77bcf86cd799439013";
  const skillId = "507f1f77bcf86cd799439014";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      category: ExperienceCategory.FULL_TIME,
      createdAt: new Date("2024-01-01"),
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Backend development",
            title: "Software Engineer",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      organizationId,
      ownerId,
      period: {
        from: new Date("2020-01-01"),
        to: new Date("2024-01-01"),
      },
      relevance: 5,
      skillIds: [skillId],
      slug: "acme-corp",
      updatedAt: new Date("2024-01-02"),
    } as ExperienceModel;

    expect(mapper.toDomain(model)).toEqual({
      category: ExperienceCategory.FULL_TIME,
      createdAt: model.createdAt,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Backend development",
            title: "Software Engineer",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      organizationId,
      ownerId,
      period: {
        from: model.period?.from,
        to: model.period?.to,
      },
      relevance: 5,
      skillIds: [skillId],
      slug: "acme-corp",
      updatedAt: model.updatedAt,
    });
  });

  it("omits organizationId when the persistence record has no organization", () => {
    const model = {
      category: ExperienceCategory.FREELANCE,
      createdAt: new Date("2024-01-01"),
      i18n: [
        {
          locale: "en",
          messages: { description: "No org", title: "Consultant" },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      ownerId,
      relevance: 0,
      slug: "freelance",
      updatedAt: new Date("2024-01-02"),
    } as ExperienceModel;

    expect(mapper.toDomain(model).organizationId).toBeUndefined();
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        category: ExperienceCategory.FULL_TIME,
        i18n: [
          {
            locale: "en",
            messages: {
              description: "Backend development",
              title: "Software Engineer",
            },
          },
        ],
        organizationId,
        skillIds: [skillId],
        slug: "acme-corp",
      })
    ).toEqual({
      category: ExperienceCategory.FULL_TIME,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Backend development",
            title: "Software Engineer",
          },
        },
      ],
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "acme-corp",
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        i18n: [
          {
            locale: "en",
            messages: { description: "Work", title: "Engineer" },
          },
        ],
        organizationId,
        skillIds: [skillId],
        slug: "acme-corp",
      })
    ).toEqual({
      i18n: [
        {
          locale: "en",
          messages: { description: "Work", title: "Engineer" },
        },
      ],
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "acme-corp",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
