import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { createMockCrud } from "@/core/persistence/repositories/testing/service-spec.mock";
import { OrganizationsRepository } from "./organizations.repository";
import { OrganizationsService } from "./organizations.service";

const ctx = testAuthContext();
const validId = "507f1f77bcf86cd799439013";

const fakeEntity = {
  id: validId,
  name: "Acme Corp",
  slug: "acme-corp",
  category: "COMPANY",
  i18n: [],
  disabled: false,
  partition: CatalogPartition.GLOBAL,
};

describe("OrganizationsService", () => {
  let service: OrganizationsService;
  let crud: ReturnType<typeof createMockCrud>;
  let repository: {
    crud: ReturnType<typeof createMockCrud>;
    countActive: jest.Mock;
    findRecentlyUpdatedActive: jest.Mock;
  };
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    repository = {
      crud,
      countActive: jest.fn().mockResolvedValue(2),
      findRecentlyUpdatedActive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: OrganizationsRepository,
          useValue: repository,
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

  describe("removeOne", () => {
    it("emits organization.deleted before deleting", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );

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

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
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

  describe("createOne", () => {
    it("delegates to crud", async () => {
      const createInput = {
        slug: "acme-corp",
        name: "Acme Corp",
        category: "COMPANY" as const,
        i18n: [{ locale: "en", messages: { description: "Acme" } }],
      };
      crud.createOne.mockResolvedValue(fakeEntity);

      await service.createOne(ctx, createInput);

      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });
  });
});
