import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProjectModel, ProjectSchema } from "@/schemas/project.schema";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: ProjectModel.name, schema: ProjectSchema }])],
  providers: [ProjectsResolver, ProjectsService],
})
export class ProjectsModule {}
