import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { GroupedExperienceEntity } from "../entities/grouped-experience.entity";

@InputType()
export class SortGroupedExperienceInput extends SortType(
  GroupedExperienceEntity,
  ["relevance", "createdAt", "updatedAt"]
) {}
