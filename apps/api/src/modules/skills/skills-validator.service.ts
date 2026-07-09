import { Injectable } from "@nestjs/common";
import { assertReferencesResolved } from "@/common/helpers/assert.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { SkillsService } from "./skills.service";

@Injectable()
export class SkillsValidatorService {
  constructor(private readonly skillsService: SkillsService) {}

  assertSkillEnabled(ctx: AuthContext, skillId: string): Promise<void> {
    return this.assertSkillsEnabled(ctx, [skillId]);
  }

  assertSkillsEnabled(ctx: AuthContext, skillIds: string[]): Promise<void> {
    return assertReferencesResolved(skillIds, (ids) =>
      this.skillsService.findManyActiveById(ctx, ids)
    );
  }
}
