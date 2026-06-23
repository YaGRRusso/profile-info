import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import type { RequestContext } from "@/core/context/request-context.interface";
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CurrentRequestContext } from "@/modules/auth/decorators/current-request-context.decorator";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import type { Ctx } from "@/modules/graphql/context.interface";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { CoursesService } from "./courses.service";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import { CourseEntity, PaginatedCourseEntity } from "./entities/course.entity";

@Resolver(() => CourseEntity)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  // QUERIES

  @Public()
  @Query(() => CourseEntity)
  findOneCourseById(@Args("courseId", { type: () => ID }) courseId: string) {
    return this.coursesService.findOneById(null, courseId);
  }

  @Public()
  @Query(() => CourseEntity)
  findOneCourse(
    @Args("courseFilters", {
      type: () => FilterCourseInput,
      nullable: true,
    })
    courseFilters?: FilterCourseInput
  ) {
    return this.coursesService.findOne(null, { filters: courseFilters });
  }

  @Public()
  @Query(() => [CourseEntity])
  findManyCourseById(
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.findManyById(null, courseIds);
  }

  @Public()
  @Query(() => PaginatedCourseEntity)
  findManyCourses(
    @Args("courseFilters", {
      type: () => FilterCourseInput,
      nullable: true,
    })
    courseFilters?: FilterCourseInput,
    @Args("coursePagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    coursePagination?: PaginationInput,
    @Args("courseSort", {
      type: () => SortCourseInput,
      nullable: true,
    })
    courseSort?: SortCourseInput
  ) {
    return this.coursesService.findMany(null, {
      filters: courseFilters,
      sort: courseSort,
      limit: coursePagination?.limit,
      skip: coursePagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => CourseEntity)
  createOneCourse(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createCourseInput", { type: () => CreateCourseInput })
    createCourseInput: CreateCourseInput
  ) {
    return this.coursesService.createOne(ctx, createCourseInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyCourses(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createCourseInputs", { type: () => [CreateCourseInput] })
    createCourseInputs: CreateCourseInput[]
  ) {
    return this.coursesService.createMany(ctx, createCourseInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => CourseEntity)
  updateOneCourse(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("courseId", { type: () => ID }) courseId: string,
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateOne(ctx, courseId, updateCourseInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyCourses(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("courseIds", { type: () => [ID] }) courseIds: string[],
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateMany(ctx, courseIds, updateCourseInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => CourseEntity)
  removeOneCourse(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("courseId", { type: () => ID }) courseId: string
  ) {
    return this.coursesService.removeOne(ctx, courseId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyCourses(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.removeMany(ctx, courseIds);
  }

  @ResolveField(() => OrganizationEntity)
  organization(@Parent() course: CourseModel, @Context() ctx: Ctx) {
    if (!course?.organization) return null;
    return ctx.loaders.batchOrganizations.load(course.organization.toString());
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() course: CourseModel, @Context() ctx: Ctx) {
    const ids = course.skills?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
