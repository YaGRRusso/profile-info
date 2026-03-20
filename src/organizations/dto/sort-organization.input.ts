import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { OrganizationEntity } from "../entities/organization.entity";

@InputType()
export class SortOrganizationInput extends SortType(OrganizationEntity, [
  "name",
  "relevance",
  "createdAt",
  "updatedAt",
]) {}
