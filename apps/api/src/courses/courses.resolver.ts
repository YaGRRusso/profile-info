import { Context, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import type { Ctx } from "@/core/interfaces/context.interface";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { OrganizationEntity } from "@/organizations/entities/organization.entity";
import { CourseModel } from "@/schemas/course.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CoursesService } from "./courses.service";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import { CourseEntity } from "./entities/course.entity";

@Resolver(() => CourseEntity)
export class CoursesResolver extends BaseResolver<
  CourseModel,
  CourseEntity,
  CreateCourseInput,
  UpdateCourseInput,
  FilterCourseInput,
  SortCourseInput
>(
  CourseEntity,
  CreateCourseInput,
  UpdateCourseInput,
  FilterCourseInput,
  SortCourseInput
) {
  constructor(readonly coursesService: CoursesService) {
    super(coursesService);
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() course: CourseModel, @Context() ctx: Ctx) {
    if (!course?.organization) return null;
    return ctx.loaders.batchOrganizations.load(course.organization.toString());
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() course: CourseModel, @Context() ctx: Ctx) {
    const ids = course.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
