import { Field, Int, ObjectType } from "@nestjs/graphql";
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
}

@ObjectType()
export class DashboardActivityItem {
  @Field(() => DashboardActivityType)
  type: DashboardActivityType;

  @Field(() => String)
  label: string;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class DashboardEntity {
  @Field(() => DashboardTotals)
  totals: DashboardTotals;

  @Field(() => [DashboardCount])
  skillsByCategory: DashboardCount[];

  @Field(() => [DashboardCount])
  experiencesByCategory: DashboardCount[];

  @Field(() => [DashboardCount])
  coursesByStatus: DashboardCount[];

  @Field(() => [DashboardActivityItem])
  recentActivity: DashboardActivityItem[];
}
