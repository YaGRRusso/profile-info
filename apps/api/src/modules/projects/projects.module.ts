import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ProjectModel,
  ProjectSchema,
} from "@/modules/projects/schemas/project.schema";
import { SkillsModule } from "@/modules/skills/skills.module";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { OnUserDeletedListener } from "./listeners/on-user-deleted.listener";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";

@Module({
  exports: [ProjectsService],
  imports: [
    SkillsModule,
    MongooseModule.forFeature([
      { name: ProjectModel.name, schema: ProjectSchema },
    ]),
  ],
  providers: [
    ProjectsRepository,
    ProjectsResolver,
    ProjectsService,
    OnSkillDeletedListener,
    OnUserDeletedListener,
  ],
})
export class ProjectsModule {}
