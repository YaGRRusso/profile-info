import { Injectable } from "@nestjs/common";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { DashboardEntity } from "./entities/dashboard.entity";
import { DashboardActivityType } from "./enums/activity-type.enum";

const RECENT_ACTIVITY_LIMIT = 5;
const RECENT_ACTIVITY_PER_ENTITY = 3;

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
      skillActivity,
      courseActivity,
      educationActivity,
      organizationActivity,
      projectActivity,
      experienceActivity,
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
      this.skillsService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
      this.coursesService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
      this.educationsService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
      this.organizationsService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
      this.projectsService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
      this.experiencesService.findRecentActivity(RECENT_ACTIVITY_PER_ENTITY),
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
      recentActivity: this.mergeRecentActivity([
        { type: DashboardActivityType.SKILL, items: skillActivity },
        { type: DashboardActivityType.COURSE, items: courseActivity },
        { type: DashboardActivityType.EDUCATION, items: educationActivity },
        {
          type: DashboardActivityType.ORGANIZATION,
          items: organizationActivity,
        },
        { type: DashboardActivityType.PROJECT, items: projectActivity },
        { type: DashboardActivityType.EXPERIENCE, items: experienceActivity },
      ]),
    };
  }

  private mergeRecentActivity(
    groups: Array<{
      type: DashboardActivityType;
      items: RecentActivityRecord[];
    }>
  ) {
    return groups
      .flatMap(({ type, items }) =>
        items.map((item) => ({
          type,
          label: item.label,
          updatedAt: item.updatedAt,
        }))
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, RECENT_ACTIVITY_LIMIT);
  }
}
