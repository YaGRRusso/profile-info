import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateCourseInput } from "./create-course.input";

@InputType()
export class FilterCourseInput extends PartialType(
  PickType(CreateCourseInput, [
    "relevance",
    "slug",
    "organizationId",
    "status",
    "url",
    "image",
    "hours",
    "i18n",
    "skillIds",
  ] as const)
) {}
