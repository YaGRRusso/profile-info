import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateProjectInput } from "./create-project.input";

@InputType()
export class FilterProjectInput extends PartialType(
  PickType(CreateProjectInput, [
    "relevance",
    "slug",
    "images",
    "skills",
    "i18n",
    "urls",
  ] as const)
) {}
