import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { FieldCount } from "@/core/persistence/types/output.type";
import { CoursesService } from "@/modules/courses/courses.service";
import { EducationsService } from "@/modules/educations/educations.service";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import type { UserEntityRecord } from "./entities/user.entity";
import type { UserOwnedCounts } from "./entities/user-owned-counts.entity";
import { UsersService } from "./users.service";

function toCountMap(rows: FieldCount[]): Map<string, number> {
  return new Map(rows.map((row) => [row.label, row.value]));
}

@Injectable()
export class UsersLoaderService {
  constructor(
    private readonly usersService: UsersService,
    private readonly experiencesService: ExperiencesService,
    private readonly educationsService: EducationsService,
    private readonly coursesService: CoursesService,
    private readonly projectsService: ProjectsService
  ) {}

  createLoader() {
    return new DataLoader<string, UserEntityRecord | null>(
      async (ids) => {
        const list = await this.usersService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { maxBatchSize: 100, name: "batchUsers" }
    );
  }

  createOwnedCountsLoader() {
    return new DataLoader<string, UserOwnedCounts>(
      async (ownerIds) => {
        const ids = [...ownerIds];
        const [experiences, educations, courses, projects] = await Promise.all([
          this.experiencesService.countByOwners(ids),
          this.educationsService.countByOwners(ids),
          this.coursesService.countByOwners(ids),
          this.projectsService.countByOwners(ids),
        ]);

        const experiencesByOwner = toCountMap(experiences);
        const educationsByOwner = toCountMap(educations);
        const coursesByOwner = toCountMap(courses);
        const projectsByOwner = toCountMap(projects);

        return ids.map((id) => ({
          courses: coursesByOwner.get(id) ?? 0,
          educations: educationsByOwner.get(id) ?? 0,
          experiences: experiencesByOwner.get(id) ?? 0,
          projects: projectsByOwner.get(id) ?? 0,
        }));
      },
      { maxBatchSize: 100, name: "batchUserOwnedCounts" }
    );
  }
}
