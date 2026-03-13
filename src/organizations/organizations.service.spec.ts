import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { OrganizationModel } from "@/schemas/organization.schema";
import { OrganizationsService } from "./organizations.service";

const OrganizationModelMock = {};

describe("OrganizationsService", () => {
  let service: OrganizationsService;
  // let model: jest.Mocked<Model<OrganizationModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getModelToken(OrganizationModel.name),
          useValue: OrganizationModelMock,
        },
      ],
    }).compile();

    service = module.get(OrganizationsService);
    // model = module.get(getModelToken(OrganizationModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
