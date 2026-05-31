import { InputType, PartialType } from "@nestjs/graphql";
import { CreateCourseInput } from "./create-course.input";

@InputType()
export class FilterCourseInput extends PartialType(CreateCourseInput) {}
