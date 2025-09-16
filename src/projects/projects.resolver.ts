import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
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

  @Query(() => [Project], { name: "projects" })
  findAll() {
    return this.projectsService.findAll();
  }

  @Query(() => Project, { name: "project" })
  findOne(@Args("id", { type: () => String }) id: string) {
    return this.projectsService.findOne(id);
  }

  @Mutation(() => Project)
  updateProject(@Args("updateProjectInput") updateProjectInput: UpdateProjectInput) {
    return this.projectsService.update(updateProjectInput.id, updateProjectInput);
  }

  @Mutation(() => Project)
  removeProject(@Args("id", { type: () => String }) id: string) {
    return this.projectsService.remove(id);
  }
}
