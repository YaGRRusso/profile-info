import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Skill } from "@/skills/entities/skill.entity";
import { SkillsService } from "@/skills/skills.service";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { Project } from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly skillsService: SkillsService
  ) {}

  @Mutation(() => Project)
  createProject(@Args("createProjectInput") createProjectInput: CreateProjectInput) {
    return this.projectsService.create(createProjectInput);
  }

  @Query(() => [Project])
  findAllProjects() {
    return this.projectsService.findAll();
  }

  @Query(() => Project)
  findOneProject(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.findOne(id);
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
  skills(@Parent() project: any) {
    return this.skillsService.findMany(project.skills);
  }
}
