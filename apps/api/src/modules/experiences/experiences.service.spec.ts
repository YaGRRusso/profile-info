import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { toTenantScope } from "@/core/context/auth-context.helper";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesRepository } from "./experiences.repository";
import { ExperiencesService } from "./experiences.service";

const ownerId = "507f1f77bcf86cd799439011";
const organizationId = "507f1f77bcf86cd799439012";
const validId = "507f1f77bcf86cd799439013";
const ctx = testAuthContext({ id: ownerId });

const fakeEntity = {
  id: validId,
  ownerId,
  slug: "software-engineer",
  roles: [],
};

describe("ExperiencesService", () => {
  let service: ExperiencesService;
  let crud: ReturnType<typeof createMockCrud>;
  let repository: {
    crud: ReturnType<typeof createMockCrud>;
    stats: ReturnType<typeof createMockStats>;
    detachSkill: jest.Mock;
    purgeByOrganization: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    repository = {
      crud,
      stats: createMockStats(),
      detachSkill: jest.fn(),
      purgeByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        { provide: ExperiencesRepository, useValue: repository },
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
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    const createInput = {
      slug: "software-engineer",
      organizationId,
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Software Engineer",
                description: "Backend development",
              },
            },
          ],
        },
      ],
    };

    it("delegates to scoped crud", async () => {
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });

  describe("updateOne", () => {
    it("delegates to scoped crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.updateOne(ctx, validId, {})).resolves.toEqual(
        fakeEntity
      );
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {});
    });
  });

  describe("removeOne", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("removeMany", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteManyById.mockResolvedValue({ succeeded: 1, failed: 0 });

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
        succeeded: 1,
        failed: 0,
      });
      expect(crud.scoped).toHaveBeenCalledWith(toTenantScope(ctx));
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
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
});
