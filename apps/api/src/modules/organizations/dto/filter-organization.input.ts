import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class FilterOrganizationInput extends PartialType(
  PickType(CreateOrganizationInput, [
    "relevance",
    "slug",
    "name",
    "website",
    "logo",
    "i18n",
    "category",
  ] as const)
) {}
