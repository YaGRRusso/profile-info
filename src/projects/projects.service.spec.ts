import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { ProjectModel } from "@/schemas/project.schema";
import { ProjectsService } from "./projects.service";

const ProjectModelMock = {};

describe("ProjectsService", () => {
  let service: ProjectsService;
  // let model: jest.Mocked<Model<ProjectModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(ProjectModel.name),
          useValue: ProjectModelMock,
        },
      ],
    }).compile();

    service = module.get(ProjectsService);
    // model = module.get(getModelToken(ProjectModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
