import { Module } from "@nestjs/common";
import { PdfModule } from "@/core/pdf/pdf.module";
import { CoursesModule } from "@/modules/courses/courses.module";
import { EducationsModule } from "@/modules/educations/educations.module";
import { ExperiencesModule } from "@/modules/experiences/experiences.module";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { UsersModule } from "@/modules/users/users.module";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";

@Module({
  controllers: [ResumeController],
  imports: [
    PdfModule,
    UsersModule,
    SkillsModule,
    ExperiencesModule,
    EducationsModule,
    CoursesModule,
    ProjectsModule,
    OrganizationsModule,
  ],
  providers: [ResumeService],
})
export class ResumeModule {}
