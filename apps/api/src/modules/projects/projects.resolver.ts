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
    return this.projectsService.findOneById(projectId);
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
    return this.projectsService.findOne({ filters: projectFilters });
  }

  @Public()
  @Query(() => [ProjectEntity])
  findManyProjectById(
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.findManyById(projectIds);
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
    return this.projectsService.findMany({
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
    @Args("createProjectInput", { type: () => CreateProjectInput })
    createProjectInput: CreateProjectInput
  ) {
    return this.projectsService.createOne(createProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => [ProjectEntity])
  createManyProjects(
    @Args("createProjectInputs", { type: () => [CreateProjectInput] })
    createProjectInputs: CreateProjectInput[]
  ) {
    return this.projectsService.createMany(createProjectInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ProjectEntity)
  updateOneProject(
    @Args("projectId", { type: () => ID }) projectId: string,
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateOne(projectId, updateProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyProjects(
    @Args("projectIds", { type: () => [ID] }) projectIds: string[],
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateMany(projectIds, updateProjectInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => ProjectEntity)
  removeOneProject(@Args("projectId", { type: () => ID }) projectId: string) {
    return this.projectsService.removeOne(projectId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyProjects(
    @Args("projectIds", { type: () => [ID] }) projectIds: string[]
  ) {
    return this.projectsService.removeMany(projectIds);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills?.map((id) => id.toString());
    if (!ids) return [];
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
