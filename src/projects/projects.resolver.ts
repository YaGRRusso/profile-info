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

  @Mutation(() => [ProjectEntity])
  createProject(
    @Args("createProjectInput", { type: () => [CreateProjectInput] })
    createProjectInput: CreateProjectInput[]
  ) {
    return this.projectsService.create(createProjectInput);
  }

  @Public()
  @Query(() => [ProjectEntity])
  findAllProjects(
    @Args("filters", { nullable: true }) filters?: FilterProjectInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ) {
    return this.projectsService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => ProjectEntity)
  findOneProjectById(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.findOneById(id);
  }

  @Mutation(() => ProjectEntity)
  updateProject(
    @Args("updateProjectInput") updateProjectInput: UpdateProjectInput
  ) {
    return this.projectsService.update(
      updateProjectInput.id,
      updateProjectInput
    );
  }

  @Mutation(() => [ProjectEntity])
  removeProject(@Args("id", { type: () => ID }) id: string[]) {
    return this.projectsService.remove(id);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
