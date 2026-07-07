import { Injectable, UnauthorizedException } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsLoaderService {
  constructor(private readonly skillsService: SkillsService) {}

  createLoader(resolveCtx: () => AuthContext | undefined) {
    return new DataLoader<string, SkillEntity | null>(
      async (ids) => {
        const ctx = resolveCtx();
        if (!ctx) {
          throw new UnauthorizedException();
        }

        const list = await this.skillsService.findManyActiveById(ctx, [...ids]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchSkills", maxBatchSize: 100 }
    );
  }
}
