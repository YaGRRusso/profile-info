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
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import type { Ctx } from "@/platform/graphql/context.interface";
import { CreateProjectInput } from "./dto/create-project.input";
import { FilterProjectInput } from "./dto/filter-project.input";
import { SortProjectInput } from "./dto/sort-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import {
  PaginatedProjectEntity,
  ProjectEntity,
} from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@Resolver(() => ProjectEntity)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  // QUERIES

  @Query(() => ProjectEntity)
  findOneProjectById(
    @Auth() ctx: AuthContext,
    @Args("projectId", { type: () => ID }) projectId: string
  ) {
    return this.projectsService.findOneById(ctx, projectId);
  }

  @Query(() => ProjectEntity)
  findOneProject(
    @Auth() ctx: AuthContext,
    @Args("projectFilters", {
      type: () => FilterProjectInput,
      nullable: true,
    })
    projectFilters?: FilterProjectInput
  ) {
    return this.projectsService.findOne(ctx, { filters: projectFilters });
  }

  @Query(() => [ProjectEntity])
  findManyProjectById(
    @Auth() ctx: AuthContext,
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.findManyById(ctx, projectIds);
  }

  @Query(() => PaginatedProjectEntity)
  findManyProjects(
    @Auth() ctx: AuthContext,
    @Args("projectFilters", {
      type: () => FilterProjectInput,
      nullable: true,
    })
    projectFilters?: FilterProjectInput,
    @Args("projectPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    projectPagination?: PaginationInput,
    @Args("projectSort", {
      type: () => SortProjectInput,
      nullable: true,
    })
    projectSort?: SortProjectInput
  ) {
    return this.projectsService.findMany(ctx, {
      filters: projectFilters,
      sort: projectSort,
      limit: projectPagination?.limit,
      skip: projectPagination?.skip,
    });
  }

  // MUTATIONS

  @Mutation(() => ProjectEntity)
  createOneProject(
    @Auth() ctx: AuthContext,
    @Args("createProjectInput", { type: () => CreateProjectInput })
    createProjectInput: CreateProjectInput
  ) {
    return this.projectsService.createOne(ctx, createProjectInput);
  }

  @Mutation(() => BatchEntity)
  createManyProjects(
    @Auth() ctx: AuthContext,
    @Args("createProjectInputs", { type: () => [CreateProjectInput] })
    createProjectInputs: CreateProjectInput[]
  ) {
    return this.projectsService.createMany(ctx, createProjectInputs);
  }

  @Mutation(() => ProjectEntity)
  updateOneProject(
    @Auth() ctx: AuthContext,
    @Args("projectId", { type: () => ID }) projectId: string,
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateOne(ctx, projectId, updateProjectInput);
  }

  @Mutation(() => BatchEntity)
  updateManyProjects(
    @Auth() ctx: AuthContext,
    @Args("projectIds", { type: () => [ID] }) projectIds: string[],
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateMany(ctx, projectIds, updateProjectInput);
  }

  @Mutation(() => ProjectEntity)
  removeOneProject(
    @Auth() ctx: AuthContext,
    @Args("projectId", { type: () => ID }) projectId: string
  ) {
    return this.projectsService.removeOne(ctx, projectId);
  }

  @Mutation(() => BatchEntity)
  removeManyProjects(
    @Auth() ctx: AuthContext,
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.removeMany(ctx, projectIds);
  }

  @ResolveField(() => UserEntity)
  owner(@Parent() project: ProjectEntity, @Context() ctx: Ctx) {
    if (!project?.ownerId) return null;
    return ctx.loaders.batchUsers.load(project.ownerId);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectEntity, @Context() ctx: Ctx) {
    const ids = project.skillIds;
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
