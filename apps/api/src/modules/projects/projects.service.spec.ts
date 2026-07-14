import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.service";

const ownerId = "507f1f77bcf86cd799439011";
const validId = "507f1f77bcf86cd799439013";
const ctx = testAuthContext({ id: ownerId });

const fakeEntity = {
  id: validId,
  ownerId,
  slug: "portfolio-app",
};

describe("ProjectsService", () => {
  let service: ProjectsService;
  let crud: ReturnType<typeof createMockCrud>;
  let stats: ReturnType<typeof createMockStats>;
  let repository: {
    tenantCrud: jest.Mock;
    tenantStats: jest.Mock;
    detachSkill: jest.Mock;
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
      purgeByOwner: jest.fn(),
      tenantCrud: jest.fn().mockReturnValue(crud),
      tenantStats: jest.fn().mockReturnValue(stats),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: repository },
        {
          provide: SkillsValidatorService,
          useValue: {
            assertSkillsEnabled: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ProjectsService);
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
      i18n: [
        {
          locale: "en",
          messages: {
            description: "My portfolio app",
            title: "Portfolio",
          },
        },
      ],
      slug: "portfolio-app",
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

  describe("detachSkill", () => {
    it("delegates to repository helper", async () => {
      await service.detachSkill(validId);
      expect(repository.detachSkill).toHaveBeenCalledWith(validId);
    });
  });

  describe("purgeByOwner", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOwner(ownerId);
      expect(repository.purgeByOwner).toHaveBeenCalledWith(ownerId);
    });
  });
});
