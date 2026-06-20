import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateEducationInput } from "./create-education.input";

@InputType()
export class FilterEducationInput extends PartialType(
  PickType(CreateEducationInput, [
    "relevance",
    "slug",
    "organization",
    "level",
    "status",
    "url",
    "image",
    "i18n",
    "period",
    "skills",
  ] as const)
) {}
