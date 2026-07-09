import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateExperienceInput } from "./create-experience.input";

@InputType()
export class FilterExperienceInput extends PartialType(
  PickType(CreateExperienceInput, [
    "relevance",
    "slug",
    "organizationId",
    "category",
    "roles",
  ] as const)
) {}
