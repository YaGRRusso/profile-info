import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { OrganizationCategory } from "../enums/category.enum";
import type { OrganizationModel } from "../schemas/organization.schema";
import { OrganizationMapper } from "./organization.mapper";

describe("OrganizationMapper", () => {
  const mapper = new OrganizationMapper();

  it("maps persistence fields to the domain entity", () => {
    const model = {
      category: OrganizationCategory.COMPANY,
      createdAt: new Date("2024-01-01"),
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
      id: "507f1f77bcf86cd799439011",
      logo: "https://example.com/logo.png",
      name: "Google",
      partition: CatalogPartition.GLOBAL,
      slug: "google",
      updatedAt: new Date("2024-01-02"),
      website: "https://www.google.com",
    } as OrganizationModel;

    expect(mapper.toDomain(model)).toEqual({
      category: OrganizationCategory.COMPANY,
      createdAt: model.createdAt,
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
      id: "507f1f77bcf86cd799439011",
      logo: "https://example.com/logo.png",
      name: "Google",
      ownerId: "",
      partition: CatalogPartition.GLOBAL,
      slug: "google",
      updatedAt: model.updatedAt,
      website: "https://www.google.com",
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
