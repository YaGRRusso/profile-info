import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { ExperienceEntity } from "../entities/experience.entity";

@InputType()
export class SortExperienceInput extends SortType(ExperienceEntity, [
  "relevance",
  "createdAt",
  "updatedAt",
]) {}
