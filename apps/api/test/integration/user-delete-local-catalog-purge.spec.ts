import { INestApplication, NotFoundException } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { organizationI18n } from "../support/organization-i18n";
import { skillI18n } from "../support/skill-i18n";

describe("User delete LOCAL catalog purge (integration)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let skillsService: SkillsService;
  let organizationsService: OrganizationsService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);
    organizationsService = testApp.module.get(OrganizationsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("purges LOCAL skills and orgs on user.deleted, leaves GLOBAL intact", async () => {
    const adminCtx = testSuperAdminContext();
    const owner = await usersService.createOne(adminCtx, {
      email: "local-purge-owner@profile.info",
      name: "Local Purge Owner",
      nickname: "local-purge-owner",
      password: "owner.123",
      role: UserRole.USER,
    });
    const ownerCtx = testAuthContext({ id: owner.id });

    const globalSkill = await skillsService.createOne(adminCtx, {
      category: "Programming",
      i18n: skillI18n("Global Keep Skill"),
      slug: "global-keep-skill",
    });
    const globalOrg = await organizationsService.createOne(adminCtx, {
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Global Keep Org"),
      logo: "https://keep.example/logo.png",
      name: "Global Keep Org",
      slug: "global-keep-org",
      website: "https://keep.example",
    });

    const localSkill = await skillsService.createOne(ownerCtx, {
      category: "Programming",
      i18n: skillI18n("Local Purge Skill"),
      slug: "local-purge-skill",
    });
    const localOrg = await organizationsService.createOne(ownerCtx, {
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Local Purge Org"),
      logo: "https://purge.example/logo.png",
      name: "Local Purge Org",
      slug: "local-purge-org",
      website: "https://purge.example",
    });

    expect(localSkill.partition).toBe(CatalogPartition.LOCAL);
    expect(localOrg.partition).toBe(CatalogPartition.LOCAL);
    expect(globalSkill.partition).toBe(CatalogPartition.GLOBAL);
    expect(globalOrg.partition).toBe(CatalogPartition.GLOBAL);

    await usersService.removeOne(owner.id);

    await expect(
      skillsService.findOneById(adminCtx, localSkill.id)
    ).rejects.toThrow(NotFoundException);
    await expect(
      organizationsService.findOneById(adminCtx, localOrg.id)
    ).rejects.toThrow(NotFoundException);

    await expect(
      skillsService.findOneById(adminCtx, globalSkill.id)
    ).resolves.toMatchObject({ id: globalSkill.id });
    await expect(
      organizationsService.findOneById(adminCtx, globalOrg.id)
    ).resolves.toMatchObject({ id: globalOrg.id });
  });
});
