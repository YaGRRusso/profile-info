import { InputType, PartialType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class UpdateOrganizationInput extends PartialType(
  CreateOrganizationInput
) {
  @OptionalField(() => Boolean)
  disabled?: boolean;
}
