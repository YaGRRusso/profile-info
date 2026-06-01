import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CourseModel, CourseSchema } from "@/schemas/course.schema";
import { EducationModel, EducationSchema } from "@/schemas/education.schema";
import { ExperienceModel, ExperienceSchema } from "@/schemas/experience.schema";
import {
  OrganizationModel,
  OrganizationSchema,
} from "@/schemas/organization.schema";
import { ProjectModel, ProjectSchema } from "@/schemas/project.schema";
import { SkillModel, SkillSchema } from "@/schemas/skill.schema";
import { DashboardResolver } from "./dashboard.resolver";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkillModel.name, schema: SkillSchema },
      { name: CourseModel.name, schema: CourseSchema },
      { name: EducationModel.name, schema: EducationSchema },
      { name: OrganizationModel.name, schema: OrganizationSchema },
      { name: ProjectModel.name, schema: ProjectSchema },
      { name: ExperienceModel.name, schema: ExperienceSchema },
    ]),
  ],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}
