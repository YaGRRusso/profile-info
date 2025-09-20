import { ObjectType, PickType } from "@nestjs/graphql";
import { User } from "@/users/entities/user.entity";

@ObjectType()
export class AuthUser extends PickType(User, ["id", "nickname", "role"]) {}
