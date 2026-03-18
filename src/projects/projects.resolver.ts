import { Context, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import type { Ctx } from "@/core/interfaces/context.interface";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import type { ProjectModel } from "@/schemas/project.schema";
import { SkillEntity } from "@/skills/entities/skill.entity";
import { CreateProjectInput } from "./dto/create-project.input";
import { FilterProjectInput } from "./dto/filter-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import { ProjectEntity } from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@Resolver(() => ProjectEntity)
export class ProjectsResolver extends BaseResolver<
  ProjectModel,
  ProjectEntity,
  CreateProjectInput,
  UpdateProjectInput,
  FilterProjectInput
>(ProjectEntity, CreateProjectInput, UpdateProjectInput, FilterProjectInput) {
  constructor(readonly projectsService: ProjectsService) {
    super(projectsService);
  }

  @ResolveField(() => [SkillEntity])
  skills(@Parent() project: ProjectModel, @Context() ctx: Ctx) {
    const ids = project.skills?.map((id) => id.toString());
    if (ids) return ctx.loaders.batchSkills.loadMany(ids);
  }
}
