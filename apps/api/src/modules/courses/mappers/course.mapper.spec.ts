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
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 5,
      slug: "typescript-fundamentals",
      ownerId,
      organizationId,
      status: CourseStatus.COMPLETE,
      url: "https://example.com",
      image: "https://example.com/image.png",
      hours: 10,
      skillIds: [skillId],
      i18n: [
        {
          locale: "en",
          messages: {
            title: "TypeScript",
            description: "Fundamentals",
          },
        },
      ],
    } as CourseModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 5,
      slug: "typescript-fundamentals",
      ownerId,
      organizationId,
      status: CourseStatus.COMPLETE,
      url: "https://example.com",
      image: "https://example.com/image.png",
      hours: 10,
      skillIds: [skillId],
      i18n: [
        {
          locale: "en",
          messages: {
            title: "TypeScript",
            description: "Fundamentals",
          },
        },
      ],
    });
  });

  it("omits organizationId when the persistence record has no organization", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 0,
      slug: "self-paced",
      ownerId,
      status: CourseStatus.IN_PROGRESS,
      i18n: [
        {
          locale: "en",
          messages: { title: "Self-paced", description: "No org" },
        },
      ],
    } as CourseModel;

    expect(mapper.toDomain(model).organizationId).toBeUndefined();
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        slug: "typescript-fundamentals",
        organizationId,
        status: CourseStatus.COMPLETE,
        i18n: [
          {
            locale: "en",
            messages: {
              title: "TypeScript",
              description: "Fundamentals",
            },
          },
        ],
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "typescript-fundamentals",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "TypeScript",
            description: "Fundamentals",
          },
        },
      ],
      skillIds: [new mongoose.Types.ObjectId(skillId)],
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        slug: "typescript-fundamentals",
        organizationId,
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "typescript-fundamentals",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
