import { Module } from "@nestjs/common";
import { CoursesModule } from "@/modules/courses/courses.module";
import { EducationsModule } from "@/modules/educations/educations.module";
import { ExperiencesModule } from "@/modules/experiences/experiences.module";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { DashboardResolver } from "./dashboard.resolver";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    SkillsModule,
    CoursesModule,
    EducationsModule,
    OrganizationsModule,
    ProjectsModule,
    ExperiencesModule,
  ],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}
