import { Test, TestingModule } from "@nestjs/testing";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { SkillsService } from "./skills.service";
import { SkillsLoaderService } from "./skills-loader.service";

const ownerId = "507f1f77bcf86cd799439011";
const skillId = "507f1f77bcf86cd799439013";

const disabledSkill = {
  category: "Programming",
  disabled: true,
  i18n: [{ locale: "en", messages: { title: "Legacy Skill" } }],
  id: skillId,
  partition: CatalogPartition.GLOBAL,
  slug: "legacy-skill",
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

  it("resolves via owner-scoped session ctx (forced USER)", async () => {
    const loaders = loaderService.createLoader();

    await expect(loaders.forKey(ownerId).load(skillId)).resolves.toEqual(
      disabledSkill
    );

    expect(skillsService.findManyById).toHaveBeenCalledWith(
      {
        credentialKind: CredentialKind.SESSION,
        id: ownerId,
        role: UserRole.USER,
      },
      [skillId]
    );
  });

  it("returns null for ids not returned by findManyById", async () => {
    skillsService.findManyById.mockResolvedValue([]);
    const loaders = loaderService.createLoader();

    await expect(loaders.forKey(ownerId).load(skillId)).resolves.toBeNull();
  });

  it("reuses the same DataLoader instance per owner within a request", () => {
    const loaders = loaderService.createLoader();
    expect(loaders.forKey(ownerId)).toBe(loaders.forKey(ownerId));
  });
});
