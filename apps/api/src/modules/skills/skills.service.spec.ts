import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, type TestingModule } from "@nestjs/testing";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { SkillsRepository } from "./skills.repository";
import { SkillsService } from "./skills.service";

const validId = "507f1f77bcf86cd799439013";

const fakeEntity = {
  id: validId,
  name: "TypeScript",
  slug: "typescript",
  category: "LANGUAGE",
};

describe("SkillsService", () => {
  let service: SkillsService;
  let crud: ReturnType<typeof createMockCrud>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: SkillsRepository,
          useValue: { crud, stats: createMockStats() },
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

  describe("findOneById", () => {
    it("delegates to crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(validId)).resolves.toEqual(fakeEntity);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    it("delegates to crud", async () => {
      const createInput = {
        name: "TypeScript",
        slug: "typescript",
        category: "LANGUAGE" as never,
      };
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(createInput)).resolves.toEqual(fakeEntity);
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });

  describe("updateOne", () => {
    it("delegates to crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.updateOne(validId, { name: "TS" })).resolves.toEqual(
        fakeEntity
      );
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, { name: "TS" });
    });
  });

  describe("removeOne", () => {
    it("emits skill.deleted before deleting", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(validId)).resolves.toEqual(fakeEntity);

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

      await expect(service.removeMany([validId])).resolves.toEqual({
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
