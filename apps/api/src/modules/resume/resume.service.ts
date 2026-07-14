import { Injectable } from "@nestjs/common";
import { sortDateRange } from "@/common/helpers/daterange.helper";
import { formatPeriod } from "@/common/helpers/format-period.helper";
import { pickTranslation } from "@/common/helpers/pick-translation.helper";
import { DEFAULT_LOCALE, type LocaleCode } from "@/common/i18n/locales";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import type { OrganizationEntityRecord } from "@/modules/organizations/entities/organization.entity";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { RESUME_LIMITS } from "./const/resume-limits.const";
import { orderSkillsByIds } from "./helpers/order-skills.helper";
import { selectResumeSkillGroups } from "./helpers/select-skill-groups.helper";
import type {
  ResumeCertification,
  ResumeDocumentData,
  ResumeEducation,
  ResumeExperience,
  ResumeExperienceRole,
  ResumeHeader,
  ResumeProject,
} from "./types/resume-document.type";

function toIdString(value: unknown): string | undefined {
  if (!value) return;
  return String(value);
}

@Injectable()
export class ResumeService {
  constructor(
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
    private readonly experiencesService: ExperiencesService,
    private readonly educationsService: EducationsService,
    private readonly coursesService: CoursesService,
    private readonly projectsService: ProjectsService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async buildResume(
    userId: string,
    locale: LocaleCode = DEFAULT_LOCALE
  ): Promise<ResumeDocumentData> {
    const user = await this.usersService.findOneById(userId);

    const ctx = toSessionAuthContext({
      id: user.id,
      role: UserRole.USER,
    });

    const skillIds = user.skillIds ?? [];

    const [
      profileSkills,
      experiencesResult,
      educationsResult,
      coursesResult,
      projectsResult,
    ] = await Promise.all([
      skillIds.length
        ? this.skillsService.findManyById(ctx, skillIds)
        : Promise.resolve([]),
      this.experiencesService.findMany(ctx, {
        limit: RESUME_LIMITS.experiences,
        sort: { relevance: -1 },
      }),
      this.educationsService.findMany(ctx, {
        filters: { status: EducationStatus.COMPLETE },
        limit: RESUME_LIMITS.educations,
        sort: { relevance: -1 },
      }),
      this.coursesService.findMany(ctx, {
        filters: { status: CourseStatus.COMPLETE },
        limit: RESUME_LIMITS.certifications,
        sort: { relevance: -1 },
      }),
      this.projectsService.findMany(ctx, {
        limit: RESUME_LIMITS.projects,
        sort: { relevance: -1 },
      }),
    ]);

    const organizationIds = new Set<string>();

    for (const experience of experiencesResult.nodes) {
      const organizationId = toIdString(experience.organizationId);
      if (organizationId) organizationIds.add(organizationId);
    }

    for (const education of educationsResult.nodes) {
      const organizationId = toIdString(education.organizationId);
      if (organizationId) organizationIds.add(organizationId);
    }

    for (const course of coursesResult.nodes) {
      const organizationId = toIdString(course.organizationId);
      if (organizationId) organizationIds.add(organizationId);
    }

    const organizations = await this.organizationsService.findManyById(ctx, [
      ...organizationIds,
    ]);

    const organizationMap = new Map(
      organizations.map((organization) => [organization.id, organization])
    );

    const userTranslation = pickTranslation(user.i18n, locale);

    const header: ResumeHeader = {
      description: userTranslation?.messages.description || undefined,
      email: user.email,
      name: user.name,
      phone: user.phone,
      title: userTranslation?.messages.title,
      urls: (user.urls ?? []).map(({ title, value }) => ({ title, value })),
    };

    const skills = selectResumeSkillGroups(
      orderSkillsByIds(skillIds, profileSkills),
      locale
    );
    const experiences = this.buildExperiences(
      experiencesResult.nodes,
      organizationMap,
      locale
    );
    const educations = this.buildEducations(
      educationsResult.nodes,
      organizationMap,
      locale
    );
    const certifications = this.buildCertifications(
      coursesResult.nodes,
      organizationMap,
      locale
    );
    const projects = this.buildProjects(projectsResult.nodes, locale);

    return {
      certifications,
      educations,
      experiences,
      header,
      locale,
      projects,
      skills,
    };
  }

  private buildExperiences(
    experiences: Awaited<ReturnType<ExperiencesService["findMany"]>>["nodes"],
    organizationMap: Map<string, OrganizationEntityRecord>,
    locale: LocaleCode
  ): ResumeExperience[] {
    return experiences.map((experience) => {
      const organization = organizationMap.get(
        String(experience.organizationId ?? "")
      );

      const roles = sortDateRange(experience.roles ?? [])
        .slice(0, RESUME_LIMITS.rolesPerExperience)
        .flatMap((role): ResumeExperienceRole[] => {
          const translation = pickTranslation(role.i18n, locale);
          if (!translation) return [];

          return [
            {
              description: translation.messages.description,
              period: formatPeriod(role.period, locale),
              title: translation.messages.title,
            },
          ];
        });

      return {
        organization: organization?.name ?? "Unknown organization",
        roles,
      };
    });
  }

  private buildEducations(
    educations: Awaited<ReturnType<EducationsService["findMany"]>>["nodes"],
    organizationMap: Map<string, OrganizationEntityRecord>,
    locale: LocaleCode
  ): ResumeEducation[] {
    return educations.flatMap((education): ResumeEducation[] => {
      const translation = pickTranslation(education.i18n, locale);
      if (!translation) return [];

      const organization = organizationMap.get(
        String(education.organizationId ?? "")
      );

      const { description } = translation.messages;

      return [
        {
          description: description || undefined,
          organization: organization?.name ?? "Unknown organization",
          period: formatPeriod(education.period, locale),
          title: translation.messages.title,
        },
      ];
    });
  }

  private buildCertifications(
    courses: Awaited<ReturnType<CoursesService["findMany"]>>["nodes"],
    organizationMap: Map<string, OrganizationEntityRecord>,
    locale: LocaleCode
  ): ResumeCertification[] {
    return courses.flatMap((course): ResumeCertification[] => {
      const translation = pickTranslation(course.i18n, locale);
      if (!translation) return [];

      const organization = organizationMap.get(
        String(course.organizationId ?? "")
      );

      const { description } = translation.messages;

      return [
        {
          description: description || undefined,
          hours: course.hours,
          organization: organization?.name ?? "Unknown organization",
          title: translation.messages.title,
        },
      ];
    });
  }

  private buildProjects(
    projects: Awaited<ReturnType<ProjectsService["findMany"]>>["nodes"],
    locale: LocaleCode
  ): ResumeProject[] {
    return projects.flatMap((project): ResumeProject[] => {
      const translation = pickTranslation(project.i18n, locale);
      if (!translation) return [];

      return [
        {
          description: translation.messages.description,
          title: translation.messages.title,
          url: project.urls?.[0]?.value,
        },
      ];
    });
  }
}
