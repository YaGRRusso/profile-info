import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import type { AppRequest } from "@/core/context/graphql-context.interface";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { SkillsService } from "./skills.service";
import { SkillsLoaderService } from "./skills-loader.service";

const ctx = testAuthContext();
const skillId = "507f1f77bcf86cd799439013";

const disabledSkill = {
  id: skillId,
  slug: "legacy-skill",
  i18n: [{ locale: "en", messages: { title: "Legacy Skill" } }],
  category: "Programming",
  disabled: true,
  partition: CatalogPartition.GLOBAL,
};

describe("SkillsLoaderService", () => {
  let loaderService: SkillsLoaderService;
  let skillsService: { findManyById: jest.Mock };

  beforeEach(async () => {
    skillsService = {
      findManyById: jest.fn().mockResolvedValue([disabledSkill]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsLoaderService,
        { provide: SkillsService, useValue: skillsService },
      ],
    }).compile();

    loaderService = module.get(SkillsLoaderService);
  });

  it("resolves disabled skills via findManyById for legacy portfolio queries", async () => {
    const req = { user: ctx } as AppRequest;
    const loader = loaderService.createLoader(req);

    await expect(loader.load(skillId)).resolves.toEqual(disabledSkill);
    expect(skillsService.findManyById).toHaveBeenCalledWith(ctx, [skillId]);
  });

  it("throws when request is unauthenticated", async () => {
    const req = {} as AppRequest;
    const loader = loaderService.createLoader(req);

    await expect(loader.load(skillId)).rejects.toThrow(UnauthorizedException);
    expect(skillsService.findManyById).not.toHaveBeenCalled();
  });
});
