import { Injectable } from "@nestjs/common";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
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

  async getDashboard(ctx: AuthContext): Promise<DashboardEntity> {
    const [
      skills,
      courses,
      educations,
      organizations,
      projects,
      experiences,
      experiencesByCategory,
      coursesByStatus,
      skillActivity,
      courseActivity,
      educationActivity,
      organizationActivity,
      projectActivity,
      experienceActivity,
    ] = await Promise.all([
      this.skillsService.count(ctx),
      this.coursesService.count(ctx),
      this.educationsService.count(ctx),
      this.organizationsService.count(ctx),
      this.projectsService.count(ctx),
      this.experiencesService.count(ctx),
      this.experiencesService.countByField(ctx, "category"),
      this.coursesService.countByField(ctx, "status"),
      this.skillsService.findRecentActivity(ctx, RECENT_ACTIVITY_PER_ENTITY),
      this.coursesService.findRecentActivity(ctx, RECENT_ACTIVITY_PER_ENTITY),
      this.educationsService.findRecentActivity(
        ctx,
        RECENT_ACTIVITY_PER_ENTITY
      ),
      this.organizationsService.findRecentActivity(
        ctx,
        RECENT_ACTIVITY_PER_ENTITY
      ),
      this.projectsService.findRecentActivity(ctx, RECENT_ACTIVITY_PER_ENTITY),
      this.experiencesService.findRecentActivity(
        ctx,
        RECENT_ACTIVITY_PER_ENTITY
      ),
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
