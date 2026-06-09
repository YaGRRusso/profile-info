import { Injectable } from "@nestjs/common";
import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { DashboardEntity } from "./entities/dashboard.entity";

@Injectable()
export class DashboardService {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly coursesService: CoursesService,
    private readonly educationsService: EducationsService,
    private readonly organizationsService: OrganizationsService,
    private readonly projectsService: ProjectsService,
    private readonly experiencesService: ExperiencesService
  ) {}

  async getDashboard(): Promise<DashboardEntity> {
    const [
      skills,
      courses,
      educations,
      organizations,
      projects,
      experiences,
      skillsByCategory,
      experiencesByCategory,
      coursesByStatus,
    ] = await Promise.all([
      this.skillsService.count(),
      this.coursesService.count(),
      this.educationsService.count(),
      this.organizationsService.count(),
      this.projectsService.count(),
      this.experiencesService.count(),
      this.skillsService.countByField("category"),
      this.experiencesService.countByField("category"),
      this.coursesService.countByField("status"),
    ]);

    return {
      totals: {
        skills,
        courses,
        educations,
        organizations,
        projects,
        experiences,
      },
      skillsByCategory,
      experiencesByCategory,
      coursesByStatus,
    };
  }
}
