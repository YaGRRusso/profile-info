import { registerEnumType } from "@nestjs/graphql";

export enum SortEnum {
  ASC = "asc",
  DESC = "desc",
}

registerEnumType(SortEnum, {
  name: "SortEnum",
});
