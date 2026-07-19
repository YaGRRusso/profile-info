import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { UsersService } from "./users.service";
import { UsersLoaderService } from "./users-loader.service";

describe("UsersLoaderService", () => {
  const ownerA = "507f1f77bcf86cd799439011";
  const ownerB = "507f1f77bcf86cd799439012";

  let experiencesService: { countByOwners: jest.Mock };
  let educationsService: { countByOwners: jest.Mock };
  let coursesService: { countByOwners: jest.Mock };
  let projectsService: { countByOwners: jest.Mock };
  let service: UsersLoaderService;

  beforeEach(() => {
    experiencesService = { countByOwners: jest.fn() };
    educationsService = { countByOwners: jest.fn() };
    coursesService = { countByOwners: jest.fn() };
    projectsService = { countByOwners: jest.fn() };

    service = new UsersLoaderService(
      {} as UsersService,
      experiencesService as unknown as ExperiencesService,
      educationsService as unknown as EducationsService,
      coursesService as unknown as CoursesService,
      projectsService as unknown as ProjectsService
    );
  });

  describe("createOwnedCountsLoader", () => {
    it("batches owner ids and maps zero when a type has no rows", async () => {
      experiencesService.countByOwners.mockResolvedValue([
        { label: ownerA, value: 2 },
      ]);
      educationsService.countByOwners.mockResolvedValue([
        { label: ownerB, value: 1 },
      ]);
      coursesService.countByOwners.mockResolvedValue([]);
      projectsService.countByOwners.mockResolvedValue([
        { label: ownerA, value: 3 },
        { label: ownerB, value: 4 },
      ]);

      const loader = service.createOwnedCountsLoader();
      const [countsA, countsB] = await Promise.all([
        loader.load(ownerA),
        loader.load(ownerB),
      ]);

      expect(experiencesService.countByOwners).toHaveBeenCalledTimes(1);
      expect(experiencesService.countByOwners).toHaveBeenCalledWith([
        ownerA,
        ownerB,
      ]);
      expect(countsA).toEqual({
        courses: 0,
        educations: 0,
        experiences: 2,
        projects: 3,
      });
      expect(countsB).toEqual({
        courses: 0,
        educations: 1,
        experiences: 0,
        projects: 4,
      });
    });
  });
});
