import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { SortEnum } from "@/core/enums/sort.enum";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { OrganizationsValidatorService } from "@/modules/organizations/organizations-validator.service";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { ExperiencesRepository } from "./experiences.repository";
import { ExperiencesService } from "./experiences.service";

const ownerId = "507f1f77bcf86cd799439011";
const organizationId = "507f1f77bcf86cd799439012";
const validId = "507f1f77bcf86cd799439013";
const ctx = testAuthContext({ id: ownerId });

const fakeEntity = {
  i18n: [],
  id: validId,
  ownerId,
  slug: "software-engineer",
};

describe("ExperiencesService", () => {
  let service: ExperiencesService;
  let crud: ReturnType<typeof createMockCrud>;
  let stats: ReturnType<typeof createMockStats>;
  let repository: {
    tenantCrud: jest.Mock;
    tenantStats: jest.Mock;
    detachSkill: jest.Mock;
    findManyGrouped: jest.Mock;
    findOneGrouped: jest.Mock;
    purgeByOrganization: jest.Mock;
    purgeByOwner: jest.Mock;
    countByOwners: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    stats = createMockStats();
    repository = {
      countByOwners: jest.fn(),
      detachSkill: jest.fn(),
      findManyGrouped: jest.fn(),
      findOneGrouped: jest.fn(),
      purgeByOrganization: jest.fn(),
      purgeByOwner: jest.fn(),
      tenantCrud: jest.fn().mockReturnValue(crud),
      tenantStats: jest.fn().mockReturnValue(stats),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        { provide: ExperiencesRepository, useValue: repository },
        {
          provide: OrganizationsValidatorService,
          useValue: {
            assertOrganizationEnabled: jest.fn().mockResolvedValue(undefined),
            assertOrganizationsEnabled: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: SkillsValidatorService,
          useValue: {
            assertSkillsEnabled: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ExperiencesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("delegates to scoped crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    const createInput = {
      category: ExperienceCategory.FULL_TIME,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Backend development",
            title: "Software Engineer",
          },
        },
      ],
      organizationId,
      slug: "software-engineer",
    };

    it("delegates to scoped crud", async () => {
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });

  describe("updateOne", () => {
    it("delegates to scoped crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.updateOne(ctx, validId, {})).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {});
    });
  });

  describe("removeOne", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("removeMany", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteManyById.mockResolvedValue({ failed: 0, succeeded: 1 });

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
        failed: 0,
        succeeded: 1,
      });
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });
  });

  describe("findManyGrouped", () => {
    it("delegates to repository.findManyGrouped", async () => {
      const page = { found: 1, nodes: [] };
      repository.findManyGrouped.mockResolvedValue(page);

      await expect(
        service.findManyGrouped(ctx, {
          limit: 3,
          sort: { relevance: SortEnum.DESC },
        })
      ).resolves.toBe(page);
      expect(repository.findManyGrouped).toHaveBeenCalledWith(ctx, {
        filters: undefined,
        limit: 3,
        skip: 0,
        sort: { relevance: SortEnum.DESC },
      });
    });
  });

  describe("findOneGrouped", () => {
    it("delegates to repository.findOneGrouped", async () => {
      const group = { experiences: [], organizationId };
      repository.findOneGrouped.mockResolvedValue(group);

      await expect(
        service.findOneGrouped(ctx, {
          filters: { organizationId },
          sort: { relevance: SortEnum.DESC },
        })
      ).resolves.toBe(group);
      expect(repository.findOneGrouped).toHaveBeenCalledWith(ctx, {
        filters: { organizationId },
        sort: { relevance: SortEnum.DESC },
      });
    });
  });

  describe("detachSkill", () => {
    it("delegates to repository helper", async () => {
      await service.detachSkill(validId);
      expect(repository.detachSkill).toHaveBeenCalledWith(validId);
    });
  });

  describe("purgeByOrganization", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOrganization(organizationId);
      expect(repository.purgeByOrganization).toHaveBeenCalledWith(
        organizationId
      );
    });
  });

  describe("purgeByOwner", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOwner(ownerId);
      expect(repository.purgeByOwner).toHaveBeenCalledWith(ownerId);
    });
  });

  describe("countByOwners", () => {
    it("delegates to repository.countByOwners", async () => {
      const rows = [{ label: ownerId, value: 2 }];
      repository.countByOwners.mockResolvedValue(rows);

      await expect(service.countByOwners([ownerId])).resolves.toBe(rows);
      expect(repository.countByOwners).toHaveBeenCalledWith([ownerId]);
    });
  });
});
