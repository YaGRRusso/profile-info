import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { REFERENCES_NOT_FOUND } from "@/common/helpers/assert.helper";
import { SkillsService } from "./skills.service";
import { SkillsValidatorService } from "./skills-validator.service";

const skillId = "507f1f77bcf86cd799439011";
const missingId = "507f1f77bcf86cd799439099";

describe("SkillsValidatorService", () => {
  let validator: SkillsValidatorService;
  let skillsService: { findManyById: jest.Mock };

  beforeEach(async () => {
    skillsService = {
      findManyById: jest.fn().mockResolvedValue([{ id: skillId }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsValidatorService,
        { provide: SkillsService, useValue: skillsService },
      ],
    }).compile();

    validator = module.get(SkillsValidatorService);
  });

  describe("assertSkillExists", () => {
    it("delegates to assertSkillsExist", async () => {
      await validator.assertSkillExists(skillId);

      expect(skillsService.findManyById).toHaveBeenCalledWith([skillId]);
    });
  });

  describe("assertSkillsExist", () => {
    it("accepts when every skill exists", async () => {
      await expect(
        validator.assertSkillsExist([skillId])
      ).resolves.toBeUndefined();
    });

    it("rejects when any skill is missing", async () => {
      skillsService.findManyById.mockResolvedValue([]);

      await expect(validator.assertSkillsExist([missingId])).rejects.toThrow(
        new BadRequestException(REFERENCES_NOT_FOUND)
      );
    });
  });
});
