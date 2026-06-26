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
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 5,
      slug: "bachelor-cs",
      ownerId,
      organizationId,
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      url: "https://example.com",
      image: "https://example.com/image.png",
      skillIds: [skillId],
      period: {
        from: new Date("2020-01-01"),
        to: new Date("2024-01-01"),
      },
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Computer Science",
            description: "Bachelor degree",
          },
        },
      ],
    } as EducationModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 5,
      slug: "bachelor-cs",
      ownerId,
      organizationId,
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      url: "https://example.com",
      image: "https://example.com/image.png",
      skillIds: [skillId],
      period: {
        from: model.period?.from,
        to: model.period?.to,
      },
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Computer Science",
            description: "Bachelor degree",
          },
        },
      ],
    });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        slug: "bachelor-cs",
        organizationId,
        level: EducationLevel.BACHELOR,
        status: EducationStatus.COMPLETE,
        i18n: [
          {
            locale: "en",
            messages: {
              title: "Computer Science",
              description: "Bachelor degree",
            },
          },
        ],
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "bachelor-cs",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Computer Science",
            description: "Bachelor degree",
          },
        },
      ],
      skillIds: [new mongoose.Types.ObjectId(skillId)],
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        slug: "bachelor-cs",
        organizationId,
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "bachelor-cs",
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
