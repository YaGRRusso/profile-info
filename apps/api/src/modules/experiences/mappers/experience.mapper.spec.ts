import mongoose from "mongoose";
import { ExperienceCategory } from "../enums/category.enum";
import type {
  ExperienceModel,
  ExperienceRoleModel,
} from "../schemas/experience.schema";
import { ExperienceMapper } from "./experience.mapper";

describe("ExperienceMapper", () => {
  const mapper = new ExperienceMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const organizationId = "507f1f77bcf86cd799439013";
  const skillId = "507f1f77bcf86cd799439014";

  it("maps persistence fields to the domain entity", () => {
    const role = {
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Software Engineer",
            description: "Backend development",
          },
        },
      ],
      period: {
        from: new Date("2020-01-01"),
        to: new Date("2024-01-01"),
      },
      skillIds: [skillId],
    } as ExperienceRoleModel;

    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 5,
      slug: "acme-corp",
      ownerId,
      organizationId,
      category: ExperienceCategory.FULL_TIME,
      roles: [role],
    } as ExperienceModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 5,
      slug: "acme-corp",
      ownerId,
      organizationId,
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Software Engineer",
                description: "Backend development",
              },
            },
          ],
          period: {
            from: role.period?.from,
            to: role.period?.to,
          },
          skillIds: [skillId],
        },
      ],
    });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        slug: "acme-corp",
        organizationId,
        category: ExperienceCategory.FULL_TIME,
        roles: [
          {
            i18n: [
              {
                locale: "en",
                messages: {
                  title: "Software Engineer",
                  description: "Backend development",
                },
              },
            ],
            skillIds: [skillId],
          },
        ],
      })
    ).toEqual({
      slug: "acme-corp",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Software Engineer",
                description: "Backend development",
              },
            },
          ],
          skillIds: [new mongoose.Types.ObjectId(skillId)],
        },
      ],
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        slug: "acme-corp",
        organizationId,
        roles: [
          {
            skillIds: [skillId],
            i18n: [
              {
                locale: "en",
                messages: { title: "Engineer", description: "Work" },
              },
            ],
          },
        ],
      })
    ).toEqual({
      slug: "acme-corp",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      roles: [
        {
          skillIds: [new mongoose.Types.ObjectId(skillId)],
          i18n: [
            {
              locale: "en",
              messages: { title: "Engineer", description: "Work" },
            },
          ],
        },
      ],
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
