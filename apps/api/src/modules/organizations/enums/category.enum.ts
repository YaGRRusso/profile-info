import { registerEnumType } from "@nestjs/graphql";

export enum OrganizationCategory {
  COMPANY = "COMPANY",
  SCHOOL = "SCHOOL",
  OTHER = "OTHER",
}

registerEnumType(OrganizationCategory, {
  name: "OrganizationCategory",
});
