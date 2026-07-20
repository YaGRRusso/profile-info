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
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { OrganizationEntity } from "@/modules/organizations/entities/organization.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
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

  @Query(() => CourseEntity)
  findOneCourseById(
    @Auth() ctx: AuthContext,
    @Args("courseId", { type: () => ID }) courseId: string
  ) {
    return this.coursesService.findOneById(ctx, courseId);
  }

  @Query(() => CourseEntity)
  findOneCourse(
    @Auth() ctx: AuthContext,
    @Args("courseFilters", {
      nullable: true,
      type: () => FilterCourseInput,
    })
    courseFilters?: FilterCourseInput
  ) {
    return this.coursesService.findOne(ctx, { filters: courseFilters });
  }

  @Query(() => [CourseEntity])
  findManyCourseById(
    @Auth() ctx: AuthContext,
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.findManyById(ctx, courseIds);
  }

  @Query(() => PaginatedCourseEntity)
  findManyCourses(
    @Auth() ctx: AuthContext,
    @Args("courseFilters", {
      nullable: true,
      type: () => FilterCourseInput,
    })
    courseFilters?: FilterCourseInput,
    @Args("coursePagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    coursePagination?: PaginationInput,
    @Args("courseSort", {
      nullable: true,
      type: () => SortCourseInput,
    })
    courseSort?: SortCourseInput
  ) {
    return this.coursesService.findMany(ctx, {
      filters: courseFilters,
      limit: coursePagination?.limit,
      skip: coursePagination?.skip,
      sort: courseSort,
    });
  }

  // MUTATIONS

  @Mutation(() => CourseEntity)
  createOneCourse(
    @Auth() ctx: AuthContext,
    @Args("createCourseInput", { type: () => CreateCourseInput })
    createCourseInput: CreateCourseInput
  ) {
    return this.coursesService.createOne(ctx, createCourseInput);
  }

  @Mutation(() => BatchEntity)
  createManyCourses(
    @Auth() ctx: AuthContext,
    @Args("createCourseInputs", { type: () => [CreateCourseInput] })
    createCourseInputs: CreateCourseInput[]
  ) {
    return this.coursesService.createMany(ctx, createCourseInputs);
  }

  @Mutation(() => CourseEntity)
  updateOneCourse(
    @Auth() ctx: AuthContext,
    @Args("courseId", { type: () => ID }) courseId: string,
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateOne(ctx, courseId, updateCourseInput);
  }

  @Mutation(() => BatchEntity)
  updateManyCourses(
    @Auth() ctx: AuthContext,
    @Args("courseIds", { type: () => [ID] }) courseIds: string[],
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateMany(ctx, courseIds, updateCourseInput);
  }

  @Mutation(() => CourseEntity)
  removeOneCourse(
    @Auth() ctx: AuthContext,
    @Args("courseId", { type: () => ID }) courseId: string
  ) {
    return this.coursesService.removeOne(ctx, courseId);
  }

  @Mutation(() => BatchEntity)
  removeManyCourses(
    @Auth() ctx: AuthContext,
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.removeMany(ctx, courseIds);
  }

  @ResolveField(() => UserEntity)
  owner(@Parent() course: CourseEntity, @Context() ctx: GraphqlContext) {
    const { ownerId } = course;
    if (!ownerId) return null;
    return ctx.loaders.batchUsers.load(ownerId);
  }

  @ResolveField(() => OrganizationEntity, { nullable: true })
  organization(@Parent() course: CourseEntity, @Context() ctx: GraphqlContext) {
    const { ownerId, organizationId } = course;
    if (!(organizationId && ownerId)) return null;
    return ctx.loaders.batchOrganizations.forKey(ownerId).load(organizationId);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() course: CourseEntity, @Context() ctx: GraphqlContext) {
    const { ownerId, skillIds } = course;
    if (!(skillIds && ownerId)) return [];
    return ctx.loaders.batchSkills.forKey(ownerId).loadMany(skillIds);
  }
}
