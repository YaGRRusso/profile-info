import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DateRangeEntity } from "@/core/entities/date-range.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import {
  ExperienceEntity,
  type ExperienceEntityRecord,
} from "./experience.entity";

@ObjectType()
export class GroupedExperienceEntity {
  @OptionalField(() => ID)
  organizationId?: string | null;

  @OptionalField(() => OrganizationEntity)
  organization?: OrganizationEntity;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;

  @Field(() => Number)
  relevance: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @OptionalField(() => DateRangeEntity)
  period?: DateRangeEntity;

  @Field(() => [ExperienceEntity])
  experiences: ExperienceEntity[];
}

export const PaginatedGroupedExperienceEntity = createPaginatedModel(
  GroupedExperienceEntity
);

export type GroupedExperienceEntityRecord = Omit<
  GroupedExperienceEntity,
  "organization" | "owner" | "experiences"
> & {
  experiences: ExperienceEntityRecord[];
};
