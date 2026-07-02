import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class FilterOrganizationInput extends PartialType(
  PickType(CreateOrganizationInput, [
    "slug",
    "name",
    "website",
    "logo",
    "i18n",
    "category",
  ] as const)
) {
  @OptionalField(() => Boolean)
  disabled?: boolean;
}
