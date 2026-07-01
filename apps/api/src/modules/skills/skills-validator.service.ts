import { Injectable } from "@nestjs/common";
import { assertReferencesResolved } from "@/common/helpers/assert.helper";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsValidatorService {
  constructor(private readonly skillsService: SkillsService) {}

  assertSkillExists(skillId: string): Promise<void> {
    return this.assertSkillsExist([skillId]);
  }

  assertSkillsExist(skillIds: string[]): Promise<void> {
    return assertReferencesResolved(skillIds, (ids) =>
      this.skillsService.findManyActiveById(ids)
    );
  }
}
