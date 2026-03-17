import { InputType, PartialType } from "@nestjs/graphql";
import { CreateEducationInput } from "./create-education.input";

@InputType()
export class FilterEducationInput extends PartialType(CreateEducationInput) {}
