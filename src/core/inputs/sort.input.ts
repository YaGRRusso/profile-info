import { Field, InputType } from "@nestjs/graphql";
import { SortEnum } from "../enums/sort.enum";

@InputType()
export class SortInput<T extends object> {
  @Field(() => String)
  field: keyof T;

  @Field(() => SortEnum)
  direction: SortEnum;
}
