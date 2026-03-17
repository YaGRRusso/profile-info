import { InputType, PartialType } from "@nestjs/graphql";
import { CreateExperienceInput } from "./create-experience.input";

@InputType()
export class FilterExperienceInput extends PartialType(CreateExperienceInput) {}
