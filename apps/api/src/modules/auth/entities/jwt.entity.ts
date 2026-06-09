import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { UserRole } from "@/core/enums/user-role.enum";

@ObjectType()
export class JwtPayload {
  @Field(() => String)
  sub: string;

  @OptionalField(() => UserRole)
  role?: UserRole;
}
