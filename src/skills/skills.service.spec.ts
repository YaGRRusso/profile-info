import { jest } from "@jest/globals";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { Skill } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { SkillsService } from "./skills.service";

const skillModelMock = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe("SkillsService", () => {
  let service: SkillsService;
  let model: jest.Mocked<Model<Skill>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getModelToken(Skill.name),
          useValue: skillModelMock,
        },
      ],
    }).compile();

    service = module.get(SkillsService);
    model = module.get(getModelToken(Skill.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should insert a new skill", async () => {
      const mockedSkill: CreateSkillInput = {
        name: "Skill #1",
        category: "Category #1",
      };
      model.create.mockResolvedValueOnce(mockedSkill as any);

      const createSkillDto = {
        name: "Skill #1",
        category: "Category #1",
      };
      const result = await service.create(createSkillDto);

      expect(result).toEqual(mockedSkill);
      expect(model.create).toHaveBeenCalledWith(createSkillDto);
    });
  });

  describe("findAll", () => {
    it("should return all skills", async () => {
      const mockedSkills: Skill[] = [
        {
          name: "Skill #1",
          category: "Category #1",
        },
        {
          name: "Skill #2",
          category: "Category #2",
        },
      ];

      model.find.mockReturnValueOnce({
        exec: async () => mockedSkills,
      } as any);

      const result = await service.findAll();

      expect(result).toEqual(mockedSkills);
      expect(model.find).toHaveBeenCalled();
    });
  });
});
