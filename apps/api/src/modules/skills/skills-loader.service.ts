import { Injectable, UnauthorizedException } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { AppRequest } from "@/core/context/graphql-context.interface";
import type { SkillEntityRecord } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsLoaderService {
  constructor(private readonly skillsService: SkillsService) {}

  createLoader(req: AppRequest) {
    return new DataLoader<string, SkillEntityRecord | null>(
      async (ids) => {
        const ctx = req.user;
        if (!ctx) {
          throw new UnauthorizedException();
        }

        const list = await this.skillsService.findManyById(ctx, [...ids]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { maxBatchSize: 100, name: "batchSkills" }
    );
  }
}
