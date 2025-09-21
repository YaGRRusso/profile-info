import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@ObjectType()
export class JwtPayload {
  @Field(() => String)
  sub: string;

  @OptionalField(() => String)
  role?: string;
}
