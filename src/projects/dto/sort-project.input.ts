import { InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { SortEnum } from "@/core/enums/sort.enum";

@InputType()
export class SortProjectInput {
  @OptionalField(() => SortEnum)
  slug?: SortEnum;

  @OptionalField(() => SortEnum)
  relevance?: SortEnum;

  @OptionalField(() => SortEnum)
  createdAt?: SortEnum;

  @OptionalField(() => SortEnum)
  updatedAt?: SortEnum;
}
