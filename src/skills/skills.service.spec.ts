import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { SkillModel } from "@/schemas/skill.schema";
import { SkillsService } from "./skills.service";

const skillModelMock = {};

describe("SkillsService", () => {
  let service: SkillsService;
  // let model: jest.Mocked<Model<SkillModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getModelToken(SkillModel.name),
          useValue: skillModelMock,
        },
      ],
    }).compile();

    service = module.get(SkillsService);
    // model = module.get(getModelToken(SkillModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
