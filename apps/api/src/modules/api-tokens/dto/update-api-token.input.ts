import { InputType, PartialType } from "@nestjs/graphql";
import { CreateApiTokenInput } from "./create-api-token.input";

@InputType()
export class UpdateApiTokenInput extends PartialType(CreateApiTokenInput) {}
