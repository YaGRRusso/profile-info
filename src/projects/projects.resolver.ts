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
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import type { Ctx } from "@/core/interfaces/context.interface";
import type { ProjectModel } from "@/schemas/project.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateProjectInput } from "./dto/create-project.input";
import { FilterProjectInput } from "./dto/filter-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { ProjectEntity } from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@Resolver(() => ProjectEntity)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  // QUERIES

  @Public()
  @Query(() => ProjectEntity)
  findOneProjectById(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.findOneById(id);
  }

  @Public()
  @Query(() => ProjectEntity)
  findOneProject(
    @Args("filters", {
      type: () => FilterProjectInput,
      nullable: true,
    })
    filters?: FilterProjectInput
  ) {
    return this.projectsService.findOne({ filters });
  }

  @Public()
  @Query(() => [ProjectEntity])
  findManyProjectById(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.projectsService.findManyById(ids);
  }

  @Public()
  @Query(() => [ProjectEntity])
  findManyProjects(
    @Args("filters", {
      type: () => FilterProjectInput,
      nullable: true,
    })
    filters?: FilterProjectInput,
    @Args("pagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput
  ) {
    return this.projectsService.findMany({
      filters,
      ...pagination,
    });
  }

  // MUTATIONS

  @Mutation(() => ProjectEntity)
  createOneProject(
    @Args("createProjectInput", { type: () => CreateProjectInput })
    createProjectInput: CreateProjectInput
  ) {
    return this.projectsService.createOne(createProjectInput);
  }

  @Mutation(() => [ProjectEntity])
  createManyProjects(
    @Args("createProjectInputs", { type: () => [CreateProjectInput] })
    createProjectInputs: CreateProjectInput[]
  ) {
    return this.projectsService.createMany(createProjectInputs);
  }

  @Mutation(() => ProjectEntity)
  updateOneProject(
    @Args("id", { type: () => ID }) id: string,
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateOne(id, updateProjectInput);
  }

  @Mutation(() => BatchEntity)
  updateManyProjects(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("updateProjectInput", { type: () => UpdateProjectInput })
    updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.updateMany(ids, updateProjectInput);
  }

  @Mutation(() => ProjectEntity)
  removeOneProject(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.removeOne(id);
  }

  @Mutation(() => BatchEntity)
  removeManyProjects(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.projectsService.removeMany(ids);
  }

  // RESOLVERS

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
