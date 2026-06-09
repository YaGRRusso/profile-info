import { Field, Int, ObjectType } from "@nestjs/graphql";

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
export class DashboardEntity {
  @Field(() => DashboardTotals)
  totals: DashboardTotals;

  @Field(() => [DashboardCount])
  skillsByCategory: DashboardCount[];

  @Field(() => [DashboardCount])
  experiencesByCategory: DashboardCount[];

  @Field(() => [DashboardCount])
  coursesByStatus: DashboardCount[];
}
