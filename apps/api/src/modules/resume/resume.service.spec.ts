import { Test, TestingModule } from "@nestjs/testing";
import mongoose from "mongoose";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { ResumeService } from "./resume.service";

const userId = new mongoose.Types.ObjectId().toHexString();

describe("ResumeService", () => {
  let service: ResumeService;
  let usersService: { findOneById: jest.Mock };
  let experiencesService: { findMany: jest.Mock };
  let educationsService: { findMany: jest.Mock };
  let coursesService: { findMany: jest.Mock };
  let projectsService: { findMany: jest.Mock };
  let skillsService: { findManyById: jest.Mock };
  let organizationsService: { findManyById: jest.Mock };

  beforeEach(async () => {
    usersService = { findOneById: jest.fn() };
    experiencesService = { findMany: jest.fn() };
    educationsService = { findMany: jest.fn() };
    coursesService = { findMany: jest.fn() };
    projectsService = { findMany: jest.fn() };
    skillsService = { findManyById: jest.fn() };
    organizationsService = { findManyById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: UsersService, useValue: usersService },
        { provide: SkillsService, useValue: skillsService },
        { provide: ExperiencesService, useValue: experiencesService },
        { provide: EducationsService, useValue: educationsService },
        { provide: CoursesService, useValue: coursesService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compile();

    service = module.get(ResumeService);
  });

  it("should scope private entities to the requested userId", async () => {
    usersService.findOneById.mockResolvedValue({
      email: "alice@profile.info",
      i18n: [],
      id: userId,
      name: "Alice",
      role: UserRole.SUPER_ADMIN,
      skillIds: [],
      urls: [],
    });

    skillsService.findManyById.mockResolvedValue([]);
    experiencesService.findMany.mockResolvedValue({ nodes: [] });
    educationsService.findMany.mockResolvedValue({ nodes: [] });
    coursesService.findMany.mockResolvedValue({ nodes: [] });
    projectsService.findMany.mockResolvedValue({ nodes: [] });
    organizationsService.findManyById.mockResolvedValue([]);

    await service.buildResume(userId);

    const ownerCtx = expect.objectContaining({
      credentialKind: "session",
      id: userId,
      role: UserRole.USER,
    });

    expect(experiencesService.findMany).toHaveBeenCalledWith(
      ownerCtx,
      expect.any(Object)
    );
    expect(educationsService.findMany).toHaveBeenCalledWith(
      ownerCtx,
      expect.any(Object)
    );
    expect(coursesService.findMany).toHaveBeenCalledWith(
      ownerCtx,
      expect.any(Object)
    );
    expect(projectsService.findMany).toHaveBeenCalledWith(
      ownerCtx,
      expect.any(Object)
    );
    expect(organizationsService.findManyById).toHaveBeenCalledWith(
      ownerCtx,
      []
    );
  });

  it("should build header data from the requested user", async () => {
    usersService.findOneById.mockResolvedValue({
      email: "alice@profile.info",
      i18n: [
        {
          locale: "en",
          messages: { description: "Backend developer", title: "Engineer" },
        },
      ],
      id: userId,
      name: "Alice",
      phone: "+5511999999999",
      role: UserRole.USER,
      skillIds: [],
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
    });

    skillsService.findManyById.mockResolvedValue([]);
    experiencesService.findMany.mockResolvedValue({ nodes: [] });
    educationsService.findMany.mockResolvedValue({ nodes: [] });
    coursesService.findMany.mockResolvedValue({ nodes: [] });
    projectsService.findMany.mockResolvedValue({ nodes: [] });
    organizationsService.findManyById.mockResolvedValue([]);

    const document = await service.buildResume(userId, "en");

    expect(document.header).toEqual(
      expect.objectContaining({
        email: "alice@profile.info",
        name: "Alice",
        phone: "+5511999999999",
        title: "Engineer",
      })
    );
  });

  it("should include course descriptions in certifications", async () => {
    usersService.findOneById.mockResolvedValue({
      email: "alice@profile.info",
      i18n: [],
      id: userId,
      name: "Alice",
      role: UserRole.USER,
      skillIds: [],
      urls: [],
    });

    skillsService.findManyById.mockResolvedValue([]);
    experiencesService.findMany.mockResolvedValue({ nodes: [] });
    educationsService.findMany.mockResolvedValue({ nodes: [] });
    projectsService.findMany.mockResolvedValue({ nodes: [] });
    organizationsService.findManyById.mockResolvedValue([
      { id: "org-1", name: "Example Org" },
    ]);

    coursesService.findMany.mockResolvedValue({
      nodes: [
        {
          hours: 40,
          i18n: [
            {
              locale: "en",
              messages: {
                description: "Deep dive into generics and utility types.",
                title: "Advanced TypeScript",
              },
            },
          ],
          organizationId: "org-1",
        },
      ],
    });

    const document = await service.buildResume(userId, "en");

    expect(document.certifications).toEqual([
      {
        description: "Deep dive into generics and utility types.",
        hours: 40,
        organization: "Example Org",
        title: "Advanced TypeScript",
      },
    ]);
  });
});
