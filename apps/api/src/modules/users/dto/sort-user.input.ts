import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { UserEntity } from "../entities/user.entity";

@InputType()
export class SortUserInput extends SortType(UserEntity, [
  "name",
  "createdAt",
  "updatedAt",
]) {}
