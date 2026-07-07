import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, type TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { expectCrudScopedToCatalog } from "@test/support/expect-crud-scoped";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { SkillsRepository } from "./skills.repository";
import { SkillsService } from "./skills.service";

const ctx = testAuthContext();
const validId = "507f1f77bcf86cd799439013";

const fakeEntity = {
  id: validId,
  slug: "typescript",
  i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
  category: "Programming",
  disabled: false,
  partition: CatalogPartition.GLOBAL,
};

describe("SkillsService", () => {
  let service: SkillsService;
  let crud: ReturnType<typeof createMockCrud>;
  let repository: {
    crud: ReturnType<typeof createMockCrud>;
    countActive: jest.Mock;
    findRecentlyUpdatedActive: jest.Mock;
    stats: ReturnType<typeof createMockStats>;
  };
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    repository = {
      crud,
      countActive: jest.fn().mockResolvedValue(2),
      findRecentlyUpdatedActive: jest.fn(),
      stats: createMockStats(),
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
      expect(repository.countActive).toHaveBeenCalled();
    });
  });

  describe("findOneById", () => {
    it("delegates to scoped crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expectCrudScopedToCatalog(crud.scoped, ctx);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    it("delegates to crud", async () => {
      const createInput = {
        slug: "typescript",
        i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
        category: "Programming",
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
      crud.deleteManyById.mockResolvedValue({ succeeded: 1, failed: 0 });

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
        succeeded: 1,
        failed: 0,
      });

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(validId)
      );
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });
  });
});
