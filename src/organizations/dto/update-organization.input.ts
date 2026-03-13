import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class UpdateOrganizationInput extends PartialType(
  CreateOrganizationInput
) {
  @Field(() => ID)
  id: string;
}
