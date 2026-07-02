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
      id: userId,
      name: "Alice",
      email: "alice@profile.info",
      role: UserRole.SUPER_ADMIN,
      i18n: [],
      urls: [],
      skillIds: [],
    });

    skillsService.findManyById.mockResolvedValue([]);
    experiencesService.findMany.mockResolvedValue({ nodes: [] });
    educationsService.findMany.mockResolvedValue({ nodes: [] });
    coursesService.findMany.mockResolvedValue({ nodes: [] });
    projectsService.findMany.mockResolvedValue({ nodes: [] });
    organizationsService.findManyById.mockResolvedValue([]);

    await service.buildResume(userId);

    const ownerCtx = expect.objectContaining({
      id: userId,
      role: UserRole.USER,
      credentialKind: "session",
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
  });

  it("should build header data from the requested user", async () => {
    usersService.findOneById.mockResolvedValue({
      id: userId,
      name: "Alice",
      email: "alice@profile.info",
      phone: "+5511999999999",
      role: UserRole.USER,
      i18n: [
        {
          locale: "en",
          messages: { title: "Engineer", description: "Backend developer" },
        },
      ],
      urls: [{ title: "GitHub", value: "https://github.com/alice" }],
      skillIds: [],
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
        name: "Alice",
        title: "Engineer",
        email: "alice@profile.info",
        phone: "+5511999999999",
      })
    );
  });
});
