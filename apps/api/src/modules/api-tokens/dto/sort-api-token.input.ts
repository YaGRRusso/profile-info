import { InputType } from "@nestjs/graphql";
import { SortType } from "@/core/inputs/sort.input";
import { ApiTokenEntity } from "../entities/api-token.entity";

@InputType()
export class SortApiTokenInput extends SortType(ApiTokenEntity, [
  "name",
  "createdAt",
  "updatedAt",
  "expiresAt",
]) {}
