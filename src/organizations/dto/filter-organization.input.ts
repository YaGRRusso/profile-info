import { InputType, PartialType } from "@nestjs/graphql";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class FilterOrganizationInput extends PartialType(
  CreateOrganizationInput
) {}
