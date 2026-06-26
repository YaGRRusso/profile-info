import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { OrganizationsRepository } from "./organizations.repository";
import { OrganizationsService } from "./organizations.service";

const validId = "507f1f77bcf86cd799439013";

const fakeEntity = {
  id: validId,
  name: "Acme Corp",
  slug: "acme-corp",
  category: "COMPANY",
  i18n: [],
};

describe("OrganizationsService", () => {
  let service: OrganizationsService;
  let crud: ReturnType<typeof createMockCrud>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: OrganizationsRepository,
          useValue: { crud, stats: createMockStats() },
        },
        {
          provide: EventEmitter2,
          useValue: { emitAsync: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(OrganizationsService);
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
      const createInput = { name: "Acme Corp" } as never;
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(createInput)).resolves.toEqual(fakeEntity);
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });

  describe("updateOne", () => {
    it("delegates to crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.updateOne(validId, {})).resolves.toEqual(fakeEntity);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {});
    });
  });

  describe("removeOne", () => {
    it("emits organization.deleted before deleting", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(validId)).resolves.toEqual(fakeEntity);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(validId)
      );
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("removeMany", () => {
    it("emits organization.deleted for each organization before deleteManyById", async () => {
      crud.findManyById.mockResolvedValue([fakeEntity]);
      crud.deleteManyById.mockResolvedValue({ succeeded: 1, failed: 0 });

      await expect(service.removeMany([validId])).resolves.toEqual({
        succeeded: 1,
        failed: 0,
      });

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(validId)
      );
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });
  });
});
