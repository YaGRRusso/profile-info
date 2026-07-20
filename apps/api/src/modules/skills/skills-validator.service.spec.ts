import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { i18nKey } from "@/core/i18n/i18n";
import { SkillsService } from "./skills.service";
import { SkillsValidatorService } from "./skills-validator.service";

const ctx = testAuthContext();
const skillId = "507f1f77bcf86cd799439011";
const missingId = "507f1f77bcf86cd799439099";

describe("SkillsValidatorService", () => {
  let validator: SkillsValidatorService;
  let skillsService: { findManyActiveById: jest.Mock };

  beforeEach(async () => {
    skillsService = {
      findManyActiveById: jest
        .fn()
        .mockResolvedValue([{ disabled: false, id: skillId }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsValidatorService,
        { provide: SkillsService, useValue: skillsService },
      ],
    }).compile();

    validator = module.get(SkillsValidatorService);
  });

  describe("assertSkillEnabled", () => {
    it("delegates to assertSkillsEnabled", async () => {
      await validator.assertSkillEnabled(ctx, skillId);

      expect(skillsService.findManyActiveById).toHaveBeenCalledWith(ctx, [
        skillId,
      ]);
    });
  });

  describe("assertSkillsEnabled", () => {
    it("accepts when every skill is enabled", async () => {
      await expect(
        validator.assertSkillsEnabled(ctx, [skillId])
      ).resolves.toBeUndefined();
    });

    it("rejects when any skill is missing", async () => {
      skillsService.findManyActiveById.mockResolvedValue([]);

      await expect(
        validator.assertSkillsEnabled(ctx, [missingId])
      ).rejects.toThrow(
        new BadRequestException(i18nKey("common.REFERENCES_NOT_FOUND"))
      );
    });

    it("rejects when any skill is disabled", async () => {
      skillsService.findManyActiveById.mockRejectedValue(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );

      await expect(
        validator.assertSkillsEnabled(ctx, [skillId])
      ).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );
    });
  });
});
