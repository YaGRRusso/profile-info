import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, type TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { i18nKey } from "@/core/i18n/i18n";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { SkillsRepository } from "./skills.repository";
import { SkillsService } from "./skills.service";

const ctx = testAuthContext();
const validId = "507f1f77bcf86cd799439013";

const fakeEntity = {
  category: "Programming",
  disabled: false,
  i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
  id: validId,
  partition: CatalogPartition.GLOBAL,
  slug: "typescript",
};

describe("SkillsService", () => {
  let service: SkillsService;
  let crud: ReturnType<typeof createMockCrud>;
  let stats: ReturnType<typeof createMockStats>;
  let repository: {
    catalogCrud: jest.Mock;
    catalogStats: jest.Mock;
    countActive: jest.Mock;
    countOwnedLocalActive: jest.Mock;
    countByField: jest.Mock;
    findRecentlyUpdatedActive: jest.Mock;
    purgeLocalByOwner: jest.Mock;
  };
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    stats = createMockStats();
    repository = {
      catalogCrud: jest.fn().mockReturnValue(crud),
      catalogStats: jest.fn().mockReturnValue(stats),
      countActive: jest.fn().mockResolvedValue(2),
      countByField: jest.fn().mockResolvedValue([]),
      countOwnedLocalActive: jest.fn().mockResolvedValue(1),
      findRecentlyUpdatedActive: jest.fn(),
      purgeLocalByOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: SkillsRepository,
          useValue: repository,
        },
        {
          provide: EventEmitter2,
          useValue: { emitAsync: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(SkillsService);
    eventEmitter = module.get(EventEmitter2);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("disableOne", () => {
    it("sets disabled to true without emitting delete", async () => {
      crud.updateOneById.mockResolvedValue({ ...fakeEntity, disabled: true });

      await expect(service.disableOne(ctx, validId)).resolves.toEqual({
        ...fakeEntity,
        disabled: true,
      });
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        disabled: true,
      });
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe("enableOne", () => {
    it("re-enables by setting disabled to false", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.enableOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        disabled: false,
      });
    });
  });

  describe("count", () => {
    it("delegates to repository.countActive", async () => {
      await expect(service.count(ctx)).resolves.toBe(2);
      expect(repository.countActive).toHaveBeenCalledWith(ctx);
    });
  });

  describe("countOwnedLocal", () => {
    it("delegates to repository.countOwnedLocalActive", async () => {
      await expect(service.countOwnedLocal(ctx)).resolves.toBe(1);
      expect(repository.countOwnedLocalActive).toHaveBeenCalledWith(ctx);
    });
  });

  describe("findOneById", () => {
    it("delegates to scoped crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.catalogCrud).toHaveBeenCalledWith(ctx);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("findOne", () => {
    it("delegates to scoped crud without forcing active filter", async () => {
      const disabledSkill = { ...fakeEntity, disabled: true };
      crud.findOne.mockResolvedValue(disabledSkill);

      await expect(
        service.findOne(ctx, { filters: { slug: "typescript" } })
      ).resolves.toEqual(disabledSkill);
      expect(crud.findOne).toHaveBeenCalledWith({
        filters: { slug: "typescript" },
      });
    });
  });

  describe("findOneActive", () => {
    it("delegates to scoped crud with active filter", async () => {
      crud.findOne.mockResolvedValue(fakeEntity);

      await expect(
        service.findOneActive(ctx, { filters: { slug: "typescript" } })
      ).resolves.toEqual(fakeEntity);
      expect(crud.findOne).toHaveBeenCalledWith({
        filters: { disabled: false, slug: "typescript" },
      });
    });

    it("forces disabled false even when client sends disabled true", async () => {
      crud.findOne.mockResolvedValue(fakeEntity);

      await service.findOneActive(ctx, {
        filters: { disabled: true, slug: "typescript" },
      });

      expect(crud.findOne).toHaveBeenCalledWith({
        filters: { disabled: false, slug: "typescript" },
      });
    });
  });

  describe("findManyById", () => {
    it("returns disabled skills for legacy query resolution", async () => {
      const disabledSkill = { ...fakeEntity, disabled: true };
      crud.findManyById.mockResolvedValue([disabledSkill]);

      await expect(service.findManyById(ctx, [validId])).resolves.toEqual([
        disabledSkill,
      ]);
      expect(repository.catalogCrud).toHaveBeenCalledWith(ctx);
      expect(crud.findManyById).toHaveBeenCalledWith([validId]);
    });
  });

  describe("findManyActiveById", () => {
    it("rejects when any skill is disabled", async () => {
      crud.findManyById.mockResolvedValue([{ ...fakeEntity, disabled: true }]);

      await expect(service.findManyActiveById(ctx, [validId])).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );
    });
  });

  describe("createOne", () => {
    it("delegates to crud", async () => {
      const createInput = {
        category: "Programming",
        i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
        slug: "typescript",
      };
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual(
        fakeEntity
      );
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });

  describe("updateOne", () => {
    it("delegates to crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(
        service.updateOne(ctx, validId, { slug: "ts" })
      ).resolves.toEqual(fakeEntity);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, { slug: "ts" });
    });
  });

  describe("removeOne", () => {
    it("emits skill.deleted before deleting", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(validId)
      );
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("removeMany", () => {
    it("emits skill.deleted for each skill before deleteManyById", async () => {
      crud.findManyById.mockResolvedValue([fakeEntity]);
      crud.deleteManyById.mockResolvedValue({ failed: 0, succeeded: 1 });

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
        failed: 0,
        succeeded: 1,
      });

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(validId)
      );
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });
  });

  describe("purgeLocalByOwner", () => {
    it("delegates to repository.purgeLocalByOwner", async () => {
      const ownerId = "507f1f77bcf86cd799439012";
      await service.purgeLocalByOwner(ownerId);
      expect(repository.purgeLocalByOwner).toHaveBeenCalledWith(ownerId);
    });
  });
});
