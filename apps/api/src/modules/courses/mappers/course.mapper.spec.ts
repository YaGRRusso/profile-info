import mongoose from "mongoose";
import { CourseStatus } from "../enums/status.enum";
import type { CourseModel } from "../schemas/course.schema";
import { CourseMapper } from "./course.mapper";

describe("CourseMapper", () => {
  const mapper = new CourseMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const organizationId = "507f1f77bcf86cd799439013";
  const skillId = "507f1f77bcf86cd799439014";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      hours: 10,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Fundamentals",
            title: "TypeScript",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      image: "https://example.com/image.png",
      organizationId,
      ownerId,
      relevance: 5,
      skillIds: [skillId],
      slug: "typescript-fundamentals",
      status: CourseStatus.COMPLETE,
      updatedAt: new Date("2024-01-02"),
      url: "https://example.com",
    } as CourseModel;

    expect(mapper.toDomain(model)).toEqual({
      createdAt: model.createdAt,
      hours: 10,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Fundamentals",
            title: "TypeScript",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      image: "https://example.com/image.png",
      organizationId,
      ownerId,
      relevance: 5,
      skillIds: [skillId],
      slug: "typescript-fundamentals",
      status: CourseStatus.COMPLETE,
      updatedAt: model.updatedAt,
      url: "https://example.com",
    });
  });

  it("omits organizationId when the persistence record has no organization", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      i18n: [
        {
          locale: "en",
          messages: { description: "No org", title: "Self-paced" },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      ownerId,
      relevance: 0,
      slug: "self-paced",
      status: CourseStatus.IN_PROGRESS,
      updatedAt: new Date("2024-01-02"),
    } as CourseModel;

    expect(mapper.toDomain(model).organizationId).toBeUndefined();
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        i18n: [
          {
            locale: "en",
            messages: {
              description: "Fundamentals",
              title: "TypeScript",
            },
          },
        ],
        organizationId,
        skillIds: [skillId],
        slug: "typescript-fundamentals",
        status: CourseStatus.COMPLETE,
      })
    ).toEqual({
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Fundamentals",
            title: "TypeScript",
          },
        },
      ],
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "typescript-fundamentals",
      status: CourseStatus.COMPLETE,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        organizationId,
        skillIds: [skillId],
        slug: "typescript-fundamentals",
      })
    ).toEqual({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "typescript-fundamentals",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
