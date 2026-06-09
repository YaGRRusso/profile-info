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
import { Public } from "@/core/decorators/public-route.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
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
    return this.coursesService.findOneById(courseId);
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
    return this.coursesService.findOne({ filters: courseFilters });
  }

  @Public()
  @Query(() => [CourseEntity])
  findManyCourseById(
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.findManyById(courseIds);
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
    return this.coursesService.findMany({
      filters: courseFilters,
      sort: courseSort,
      limit: coursePagination?.limit,
      skip: coursePagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.ADMIN)
  @Mutation(() => CourseEntity)
  createOneCourse(
    @Args("createCourseInput", { type: () => CreateCourseInput })
    createCourseInput: CreateCourseInput
  ) {
    return this.coursesService.createOne(createCourseInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => [CourseEntity])
  createManyCourses(
    @Args("createCourseInputs", { type: () => [CreateCourseInput] })
    createCourseInputs: CreateCourseInput[]
  ) {
    return this.coursesService.createMany(createCourseInputs);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => CourseEntity)
  updateOneCourse(
    @Args("courseId", { type: () => ID }) courseId: string,
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateOne(courseId, updateCourseInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  updateManyCourses(
    @Args("courseIds", { type: () => [ID] }) courseIds: string[],
    @Args("updateCourseInput", { type: () => UpdateCourseInput })
    updateCourseInput: UpdateCourseInput
  ) {
    return this.coursesService.updateMany(courseIds, updateCourseInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => CourseEntity)
  removeOneCourse(@Args("courseId", { type: () => ID }) courseId: string) {
    return this.coursesService.removeOne(courseId);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  removeManyCourses(
    @Args("courseIds", { type: () => [ID] }) courseIds: string[]
  ) {
    return this.coursesService.removeMany(courseIds);
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
