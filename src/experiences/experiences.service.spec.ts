import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { ExperienceModel } from "@/schemas/experience.schema";
import { ExperiencesService } from "./experiences.service";

const ExperienceModelMock = {};

describe("ExperiencesService", () => {
  let service: ExperiencesService;
  // let model: jest.Mocked<Model<ExperienceModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        {
          provide: getModelToken(ExperienceModel.name),
          useValue: ExperienceModelMock,
        },
      ],
    }).compile();

    service = module.get(ExperiencesService);
    // model = module.get(getModelToken(ExperienceModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
