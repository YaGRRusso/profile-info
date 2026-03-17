import { InputType, PartialType } from "@nestjs/graphql";
import { CreateProjectInput } from "./create-project.input";

@InputType()
export class FilterProjectInput extends PartialType(CreateProjectInput) {}
