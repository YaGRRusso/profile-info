import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import type { Ctx } from "@/core/interfaces/context.interface";
import type { ProjectModel } from "@/schemas/project.schema";
import { Skill } from "@/skills/entities/skill.entity";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { Project } from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Mutation(() => Project)
  createProject(@Args("createProjectInput") createProjectInput: CreateProjectInput) {
    return this.projectsService.create(createProjectInput);
  }

  @Query(() => [Project])
  findAllProjects() {
    return this.projectsService.findAll();
  }

  @Query(() => Project)
  findOneProjectById(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.findOneById(id);
  }

  @Mutation(() => Project)
  updateProject(@Args("updateProjectInput") updateProjectInput: UpdateProjectInput) {
    return this.projectsService.update(updateProjectInput.id, updateProjectInput);
  }

  @Mutation(() => Project)
  removeProject(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.remove(id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills.map((id) => id.toString());
    return ctx.loaders.batchSkills.loadMany(ids);
  }
}
