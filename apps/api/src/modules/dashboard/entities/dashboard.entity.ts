import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { DashboardActivityType } from "../enums/activity-type.enum";

@ObjectType()
export class DashboardCount {
  @Field(() => String)
  label: string;

  @Field(() => Int)
  value: number;
}

@ObjectType()
export class DashboardTotals {
  @Field(() => Int)
  skills: number;

  @Field(() => Int)
  courses: number;

  @Field(() => Int)
  educations: number;

  @Field(() => Int)
  organizations: number;

  @Field(() => Int)
  projects: number;

  @Field(() => Int)
  experiences: number;

  @Field(() => Int)
  ownedLocalOrganizations: number;

  @Field(() => Int)
  ownedLocalSkills: number;
}

@ObjectType()
export class DashboardActivityMessages {
  @Field(() => String)
  title: string;
}

@ObjectType()
export class DashboardActivityTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => DashboardActivityMessages)
  messages: DashboardActivityMessages;
}

@ObjectType()
export class DashboardActivityItem {
  @Field(() => DashboardActivityType)
  type: DashboardActivityType;

  @OptionalField(() => String)
  slug?: string;

  @Field(() => [DashboardActivityTranslationLocale])
  i18n: DashboardActivityTranslationLocale[];

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class DashboardEntity {
  @Field(() => DashboardTotals)
  totals: DashboardTotals;

  @Field(() => [DashboardCount])
  experiencesByCategory: DashboardCount[];

  @Field(() => [DashboardCount])
  coursesByStatus: DashboardCount[];

  @Field(() => [DashboardActivityItem])
  recentActivity: DashboardActivityItem[];
}
