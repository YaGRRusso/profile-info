import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { EducationEntity } from "../entities/education.entity";

@InputType()
export class SortEducationInput extends SortType(EducationEntity, [
  "relevance",
  "createdAt",
  "updatedAt",
]) {}
