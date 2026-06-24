import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { CreateApiTokenInput } from "./create-api-token.input";

@InputType()
export class FilterApiTokenInput extends PartialType(
  PickType(CreateApiTokenInput, ["name", "permissions", "expiresAt"] as const)
) {}
