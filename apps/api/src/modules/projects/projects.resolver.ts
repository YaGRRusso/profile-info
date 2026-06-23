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
import type { Ctx } from "@/modules/graphql/context.interface";
import type { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
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

  @Public()
  @Query(() => ProjectEntity)
  findOneProjectById(@Args("projectId", { type: () => ID }) projectId: string) {
    return this.projectsService.findOneById(null, projectId);
  }

  @Public()
  @Query(() => ProjectEntity)
  findOneProject(
    @Args("projectFilters", {
      type: () => FilterProjectInput,
      nullable: true,
    })
    projectFilters?: FilterProjectInput
  ) {
    return this.projectsService.findOne(null, { filters: projectFilters });
  }

  @Public()
  @Query(() => [ProjectEntity])
  findManyProjectById(
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.findManyById(null, projectIds);
  }

  @Public()
  @Query(() => PaginatedProjectEntity)
  findManyProjects(
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
    return this.projectsService.findMany(null, {
      filters: projectFilters,
      sort: projectSort,
      limit: projectPagination?.limit,
      skip: projectPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ProjectEntity)
  createOneProject(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createProjectInput", { type: () => CreateProjectInput })
    createProjectInput: CreateProjectInput
  ) {
    return this.projectsService.createOne(ctx, createProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyProjects(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("createProjectInputs", { type: () => [CreateProjectInput] })
    createProjectInputs: CreateProjectInput[]
  ) {
    return this.projectsService.createMany(ctx, createProjectInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ProjectEntity)
  updateOneProject(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("projectId", { type: () => ID }) projectId: string,
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateOne(ctx, projectId, updateProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyProjects(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("projectIds", { type: () => [ID] }) projectIds: string[],
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateMany(ctx, projectIds, updateProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ProjectEntity)
  removeOneProject(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("projectId", { type: () => ID }) projectId: string
  ) {
    return this.projectsService.removeOne(ctx, projectId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyProjects(
    @CurrentRequestContext() ctx: RequestContext,
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.removeMany(ctx, projectIds);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
