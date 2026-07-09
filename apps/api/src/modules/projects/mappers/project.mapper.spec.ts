import mongoose from "mongoose";
import type { ProjectModel } from "../schemas/project.schema";
import { ProjectMapper } from "./project.mapper";

describe("ProjectMapper", () => {
  const mapper = new ProjectMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const skillId = "507f1f77bcf86cd799439013";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      relevance: 5,
      slug: "portfolio-app",
      ownerId,
      images: ["https://example.com/image.png"],
      skillIds: [skillId],
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Portfolio",
            description: "My portfolio app",
          },
        },
      ],
      urls: [{ title: "GitHub", value: "https://github.com/example" }],
    } as ProjectModel;

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      relevance: 5,
      slug: "portfolio-app",
      ownerId,
      images: ["https://example.com/image.png"],
      skillIds: [skillId],
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Portfolio",
            description: "My portfolio app",
          },
        },
      ],
      urls: [{ title: "GitHub", value: "https://github.com/example" }],
    });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        slug: "portfolio-app",
        i18n: [
          {
            locale: "en",
            messages: {
              title: "Portfolio",
              description: "My portfolio app",
            },
          },
        ],
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "portfolio-app",
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Portfolio",
            description: "My portfolio app",
          },
        },
      ],
      skillIds: [new mongoose.Types.ObjectId(skillId)],
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        slug: "portfolio-app",
        skillIds: [skillId],
      })
    ).toEqual({
      slug: "portfolio-app",
      skillIds: [new mongoose.Types.ObjectId(skillId)],
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
