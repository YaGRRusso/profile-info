import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { ProjectEntity } from "../entities/project.entity";

@InputType()
export class SortProjectInput extends SortType(ProjectEntity, [
  "relevance",
  "createdAt",
  "updatedAt",
]) {}
