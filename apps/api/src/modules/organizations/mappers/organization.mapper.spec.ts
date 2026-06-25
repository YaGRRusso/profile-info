import { OrganizationCategory } from "../enums/category.enum";
import type { OrganizationModel } from "../schemas/organization.schema";
import { toOrganizationEntity } from "./organization.mapper";

describe("toOrganizationEntity", () => {
  it("maps persistence fields to the GraphQL entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      category: OrganizationCategory.COMPANY,
      name: "Google",
      relevance: 5,
      slug: "google",
      website: "https://www.google.com",
      logo: "https://example.com/logo.png",
      i18n: [
        {
          locale: "en",
          messages: {
            description: "big company",
          },
        },
        {
          locale: "pt",
          messages: {
            description: "grande empresa",
          },
        },
      ],
    } as OrganizationModel;

    expect(toOrganizationEntity(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      category: OrganizationCategory.COMPANY,
      name: "Google",
      relevance: 5,
      slug: "google",
      website: "https://www.google.com",
      logo: "https://example.com/logo.png",
      i18n: [
        {
          locale: "en",
          messages: {
            description: "big company",
          },
        },
        {
          locale: "pt",
          messages: {
            description: "grande empresa",
          },
        },
      ],
    });
  });
});
