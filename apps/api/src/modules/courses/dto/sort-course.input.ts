import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { CourseEntity } from "../entities/course.entity";

@InputType()
export class SortCourseInput extends SortType(CourseEntity, [
  "relevance",
  "createdAt",
  "updatedAt",
]) {}
