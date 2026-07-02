import { OrganizationCategory } from "../enums/category.enum";
import type { OrganizationModel } from "../schemas/organization.schema";
import { OrganizationMapper } from "./organization.mapper";

describe("OrganizationMapper", () => {
  const mapper = new OrganizationMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      category: OrganizationCategory.COMPANY,
      name: "Google",
      slug: "google",
      website: "https://www.google.com",
      logo: "https://example.com/logo.png",
      disabled: false,
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

    expect(mapper.toDomain(model)).toEqual({
      id: "507f1f77bcf86cd799439011",
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      category: OrganizationCategory.COMPANY,
      name: "Google",
      slug: "google",
      website: "https://www.google.com",
      logo: "https://example.com/logo.png",
      disabled: false,
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

  it("maps filter input to a persistence query", () => {
    expect(mapper.toPersistenceForFilter({ name: "Google" })).toEqual({
      name: "Google",
    });
  });

  it("maps sort input to a persistence sort", () => {
    expect(mapper.toPersistenceForSort({ name: 1 })).toEqual({ name: 1 });
  });
});
