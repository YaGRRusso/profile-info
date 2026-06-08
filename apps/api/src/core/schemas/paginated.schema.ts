import { Type } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";

export interface PaginatedModel<T> {
  found: number;
  nodes: T[];
}

export function createPaginatedModel<T>(NodeModel: Type<T>) {
  @ObjectType(`Paginated${NodeModel.name}`)
  class PaginatedModelClass implements PaginatedModel<T> {
    @Field(() => Number)
    found: number;

    @Field(() => [NodeModel])
    nodes: T[];
  }

  return PaginatedModelClass as Type<PaginatedModel<T>>;
}
