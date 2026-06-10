import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ProjectModel,
  ProjectSchema,
} from "@/modules/projects/schemas/project.schema";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectModel.name, schema: ProjectSchema },
    ]),
  ],
  providers: [
    ProjectsRepository,
    ProjectsResolver,
    ProjectsService,
    OnSkillDeletedListener,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
