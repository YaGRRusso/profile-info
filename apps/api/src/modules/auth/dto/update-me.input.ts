import { InputType, OmitType, PartialType } from "@nestjs/graphql";
import { CreateUserInput } from "@/modules/users/dto/create-user.input";

@InputType()
export class UpdateMeInput extends PartialType(
  OmitType(CreateUserInput, ["role"] as const)
) {}
