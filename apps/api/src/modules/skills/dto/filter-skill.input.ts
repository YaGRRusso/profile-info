import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { CreateSkillInput } from "./create-skill.input";

@InputType()
export class FilterSkillInput extends PartialType(
  PickType(CreateSkillInput, ["slug", "category"] as const)
) {
  @OptionalField(() => Boolean)
  disabled?: boolean;

  @OptionalField(() => CatalogPartition)
  @IsEnum(CatalogPartition)
  partition?: CatalogPartition;

  @OptionalField(() => String)
  @IsString()
  ownerId?: string;
}
