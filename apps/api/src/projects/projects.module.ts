import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProjectModel, ProjectSchema } from "@/schemas/project.schema";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectModel.name, schema: ProjectSchema },
    ]),
  ],
  providers: [ProjectsResolver, ProjectsService, OnSkillDeletedListener],
})
export class ProjectsModule {}
