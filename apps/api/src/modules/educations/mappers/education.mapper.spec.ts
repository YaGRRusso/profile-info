import mongoose from "mongoose";
import { EducationLevel } from "../enums/level.enum";
import { EducationStatus } from "../enums/status.enum";
import type { EducationModel } from "../schemas/education.schema";
import { EducationMapper } from "./education.mapper";

describe("EducationMapper", () => {
  const mapper = new EducationMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const organizationId = "507f1f77bcf86cd799439013";
  const skillId = "507f1f77bcf86cd799439014";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Bachelor degree",
            title: "Computer Science",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      image: "https://example.com/image.png",
      level: EducationLevel.BACHELOR,
      organizationId,
      ownerId,
      period: {
        from: new Date("2020-01-01"),
        to: new Date("2024-01-01"),
      },
      relevance: 5,
      skillIds: [skillId],
      slug: "bachelor-cs",
      status: EducationStatus.COMPLETE,
      updatedAt: new Date("2024-01-02"),
      url: "https://example.com",
    } as EducationModel;

    expect(mapper.toDomain(model)).toEqual({
      createdAt: model.createdAt,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Bachelor degree",
            title: "Computer Science",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      image: "https://example.com/image.png",
      level: EducationLevel.BACHELOR,
      organizationId,
      ownerId,
      period: {
        from: model.period?.from,
        to: model.period?.to,
      },
      relevance: 5,
      skillIds: [skillId],
      slug: "bachelor-cs",
      status: EducationStatus.COMPLETE,
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
          messages: { description: "No org", title: "Informal" },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      level: EducationLevel.OTHER,
      ownerId,
      relevance: 0,
      slug: "informal-course",
      status: EducationStatus.IN_PROGRESS,
      updatedAt: new Date("2024-01-02"),
    } as EducationModel;

    expect(mapper.toDomain(model).organizationId).toBeUndefined();
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        i18n: [
          {
            locale: "en",
            messages: {
              description: "Bachelor degree",
              title: "Computer Science",
            },
          },
        ],
        level: EducationLevel.BACHELOR,
        organizationId,
        skillIds: [skillId],
        slug: "bachelor-cs",
        status: EducationStatus.COMPLETE,
      })
    ).toEqual({
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Bachelor degree",
            title: "Computer Science",
          },
        },
      ],
      level: EducationLevel.BACHELOR,
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "bachelor-cs",
      status: EducationStatus.COMPLETE,
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        organizationId,
        skillIds: [skillId],
        slug: "bachelor-cs",
      })
    ).toEqual({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "bachelor-cs",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
