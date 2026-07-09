import { InputType } from "@nestjs/graphql";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";

@InputType()
export class CreateApiTokenInput {
  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @RequiredField(() => [ApiTokenPermission])
  @IsArray()
  @IsEnum(ApiTokenPermission, { each: true })
  permissions: ApiTokenPermission[];

  @OptionalField(() => Date)
  expiresAt?: Date;
}
