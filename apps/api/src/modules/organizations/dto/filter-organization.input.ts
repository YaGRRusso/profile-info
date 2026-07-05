import { InputType, PartialType, PickType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { CreateOrganizationInput } from "./create-organization.input";

@InputType()
export class FilterOrganizationInput extends PartialType(
  PickType(CreateOrganizationInput, [
    "slug",
    "name",
    "website",
    "logo",
    "i18n",
    "category",
  ] as const)
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
