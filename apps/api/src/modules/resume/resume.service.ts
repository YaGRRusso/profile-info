import { Injectable, NotFoundException } from "@nestjs/common";
import { sortDateRange } from "@/common/helpers/daterange.helper";
import { formatPeriod } from "@/common/helpers/format-period.helper";
import { pickTranslation } from "@/common/helpers/pick-translation.helper";
import { truncateText } from "@/common/helpers/truncate-text.helper";
import { DEFAULT_LOCALE, type LocaleCode } from "@/common/i18n/locales";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { selectResumeSkillGroups } from "./helpers/select-skill-groups.helper";
import { RESUME_LIMITS } from "./resume.constants";
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
    locale: LocaleCode = DEFAULT_LOCALE
  ): Promise<ResumeDocumentData> {
    const { nodes: users } = await this.usersService.findMany({
      filters: { role: UserRole.ADMIN },
      limit: 1,
    });

    const user = users[0];
    if (!user) throw new NotFoundException("Profile user not found");

    const [
      skillsResult,
      experiencesResult,
      educationsResult,
      coursesResult,
      projectsResult,
    ] = await Promise.all([
      this.skillsService.findMany({
        sort: { relevance: -1 },
      }),
      this.experiencesService.findMany({
        sort: { relevance: -1 },
        limit: RESUME_LIMITS.experiences,
      }),
      this.educationsService.findMany({
        filters: { status: "COMPLETE" },
        sort: { relevance: -1 },
        limit: RESUME_LIMITS.educations,
      }),
      this.coursesService.findMany({
        filters: { status: "COMPLETE" },
        sort: { relevance: -1 },
        limit: RESUME_LIMITS.certifications,
      }),
      this.projectsService.findMany({
        sort: { relevance: -1 },
        limit: RESUME_LIMITS.projects,
      }),
    ]);

    const organizationIds = new Set<string>();

    for (const experience of experiencesResult.nodes) {
      const organizationId = toIdString(experience.organization);
      if (organizationId) organizationIds.add(organizationId);
    }

    for (const education of educationsResult.nodes) {
      const organizationId = toIdString(education.organization);
      if (organizationId) organizationIds.add(organizationId);
    }

    for (const course of coursesResult.nodes) {
      const organizationId = toIdString(course.organization);
      if (organizationId) organizationIds.add(organizationId);
    }

    const organizations = await this.organizationsService.findManyById([
      ...organizationIds,
    ]);

    const organizationMap = new Map(
      organizations.map((organization) => [
        String(organization._id),
        organization,
      ])
    );

    const header: ResumeHeader = {
      name: user.name,
      title: user.title,
      email: user.email,
      phone: user.phone,
      urls: (user.urls ?? []).map(({ title, value }) => ({ title, value })),
    };

    const skills = selectResumeSkillGroups(skillsResult.nodes);
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
      locale,
      header,
      skills,
      experiences,
      educations,
      certifications,
      projects,
    };
  }

  private buildExperiences(
    experiences: Awaited<ReturnType<ExperiencesService["findMany"]>>["nodes"],
    organizationMap: Map<string, OrganizationModel>,
    locale: LocaleCode
  ): ResumeExperience[] {
    return experiences.map((experience) => {
      const organization = organizationMap.get(
        String(experience.organization ?? "")
      );

      const roles = sortDateRange(experience.roles ?? [])
        .slice(0, RESUME_LIMITS.rolesPerExperience)
        .flatMap((role): ResumeExperienceRole[] => {
          const translation = pickTranslation(role.i18n, locale);
          if (!translation) return [];

          return [
            {
              title: translation.messages.title,
              description: truncateText(
                translation.messages.description,
                RESUME_LIMITS.descriptionMaxLength
              ),
              period: formatPeriod(role.period, locale),
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
    organizationMap: Map<string, OrganizationModel>,
    locale: LocaleCode
  ): ResumeEducation[] {
    return educations.flatMap((education): ResumeEducation[] => {
      const translation = pickTranslation(education.i18n, locale);
      if (!translation) return [];

      const organization = organizationMap.get(
        String(education.organization ?? "")
      );

      const description = truncateText(
        translation.messages.description,
        RESUME_LIMITS.descriptionMaxLength
      );

      return [
        {
          title: translation.messages.title,
          organization: organization?.name ?? "Unknown organization",
          period: formatPeriod(education.period, locale),
          description: description || undefined,
        },
      ];
    });
  }

  private buildCertifications(
    courses: Awaited<ReturnType<CoursesService["findMany"]>>["nodes"],
    organizationMap: Map<string, OrganizationModel>,
    locale: LocaleCode
  ): ResumeCertification[] {
    return courses.flatMap((course): ResumeCertification[] => {
      const translation = pickTranslation(course.i18n, locale);
      if (!translation) return [];

      const organization = organizationMap.get(
        String(course.organization ?? "")
      );

      return [
        {
          title: translation.messages.title,
          organization: organization?.name ?? "Unknown organization",
          hours: course.hours,
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
          title: translation.messages.title,
          description: truncateText(
            translation.messages.description,
            RESUME_LIMITS.descriptionMaxLength
          ),
          url: project.urls?.[0]?.value,
        },
      ];
    });
  }
}
