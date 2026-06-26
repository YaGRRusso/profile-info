import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsLoaderService {
  constructor(private readonly skillsService: SkillsService) {}

  createLoader() {
    return new DataLoader<string, SkillEntity | null>(
      async (ids) => {
        const list = await this.skillsService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id.toString());
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchSkills", maxBatchSize: 100 }
    );
  }
}
