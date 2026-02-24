import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { EducationModel } from "@/schemas/education.schema";
import { EducationsService } from "./educations.service";

const EducationModelMock = {};

describe("EducationsService", () => {
  let service: EducationsService;
  // let model: jest.Mocked<Model<EducationModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationsService,
        {
          provide: getModelToken(EducationModel.name),
          useValue: EducationModelMock,
        },
      ],
    }).compile();

    service = module.get(EducationsService);
    // model = module.get(getModelToken(EducationModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
