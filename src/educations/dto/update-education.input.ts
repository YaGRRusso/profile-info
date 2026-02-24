import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateEducationInput } from "./create-education.input";

@InputType()
export class UpdateEducationInput extends PartialType(CreateEducationInput) {
  @Field(() => ID)
  id: string;
}
