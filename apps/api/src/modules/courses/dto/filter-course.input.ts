import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateCourseInput } from "./create-course.input";

@InputType()
export class FilterCourseInput extends PartialType(
  PickType(CreateCourseInput, [
    "relevance",
    "slug",
    "organization",
    "status",
    "url",
    "image",
    "hours",
    "i18n",
    "period",
    "skills",
  ] as const)
) {}
