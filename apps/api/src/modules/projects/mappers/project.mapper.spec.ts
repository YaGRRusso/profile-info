import mongoose from "mongoose";
import type { ProjectModel } from "../schemas/project.schema";
import { ProjectMapper } from "./project.mapper";

describe("ProjectMapper", () => {
  const mapper = new ProjectMapper();
  const ownerId = "507f1f77bcf86cd799439012";
  const skillId = "507f1f77bcf86cd799439013";

  it("maps persistence fields to the domain entity", () => {
    const model = {
      createdAt: new Date("2024-01-01"),
      i18n: [
        {
          locale: "en",
          messages: {
            description: "My portfolio app",
            title: "Portfolio",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      images: ["https://example.com/image.png"],
      ownerId,
      relevance: 5,
      skillIds: [skillId],
      slug: "portfolio-app",
      updatedAt: new Date("2024-01-02"),
      urls: [{ title: "GitHub", value: "https://github.com/example" }],
    } as ProjectModel;

    expect(mapper.toDomain(model)).toEqual({
      createdAt: model.createdAt,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "My portfolio app",
            title: "Portfolio",
          },
        },
      ],
      id: "507f1f77bcf86cd799439011",
      images: ["https://example.com/image.png"],
      ownerId,
      relevance: 5,
      skillIds: [skillId],
      slug: "portfolio-app",
      updatedAt: model.updatedAt,
      urls: [{ title: "GitHub", value: "https://github.com/example" }],
    });
  });

  it("maps create input to a persistence payload", () => {
    expect(
      mapper.toPersistenceForCreate({
        i18n: [
          {
            locale: "en",
            messages: {
              description: "My portfolio app",
              title: "Portfolio",
            },
          },
        ],
        skillIds: [skillId],
        slug: "portfolio-app",
      })
    ).toEqual({
      i18n: [
        {
          locale: "en",
          messages: {
            description: "My portfolio app",
            title: "Portfolio",
          },
        },
      ],
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "portfolio-app",
    });
  });

  it("maps filter input to a persistence query", () => {
    expect(
      mapper.toPersistenceForFilter({
        skillIds: [skillId],
        slug: "portfolio-app",
      })
    ).toEqual({
      skillIds: [new mongoose.Types.ObjectId(skillId)],
      slug: "portfolio-app",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });
});
