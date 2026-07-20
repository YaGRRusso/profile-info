import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import { UserRole } from "@/core/enums/user-role.enum";
import {
  createKeyedLoaderCache,
  type KeyedLoader,
} from "@/core/loaders/keyed-loader-cache";
import type { SkillEntityRecord } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsLoaderService {
  constructor(private readonly skillsService: SkillsService) {}

  createLoader(): KeyedLoader<SkillEntityRecord> {
    return createKeyedLoaderCache((ownerId) => {
      const ctx = toSessionAuthContext({
        id: ownerId,
        role: UserRole.USER,
      });

      return new DataLoader<string, SkillEntityRecord | null>(
        async (ids) => {
          const list = await this.skillsService.findManyById(ctx, [...ids]);
          const map = keyBy(list, (item) => item.id);
          return ids.map((id) => map[id] ?? null);
        },
        { maxBatchSize: 100, name: `batchSkills:${ownerId}` }
      );
    });
  }
}
