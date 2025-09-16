import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { jest } from "@jest/globals";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { INestApplication } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { SkillsResolver } from "@/skills/skills.resolver";
import { SkillsService } from "@/skills/skills.service";

const mockSkillsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe("Skills (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          autoSchemaFile: join(process.cwd(), "src/schema.gql"),
          sortSchema: true,
          playground: false,
        }),
      ],
      providers: [
        SkillsResolver,
        { provide: SkillsService, useValue: mockSkillsService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createSkill mutation", async () => {
    const dto = { name: "Skill #1", category: "Cat" };
    const created = { id: "1", ...dto };
    (mockSkillsService.create as any).mockResolvedValueOnce(created);

    const mutation =
      "mutation CreateSkill($input: CreateSkillInput!) {\n  createSkill(createSkillInput: $input) { id name category }\n}";

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: mutation, variables: { input: dto } })
      .expect(200);

    expect(res.body.data.createSkill).toEqual(created);
    expect(mockSkillsService.create).toHaveBeenCalledWith(dto);
  });

  it("findAllSkills query", async () => {
    const list = [
      { id: "1", name: "A", category: "X" },
      { id: "2", name: "B", category: "Y" },
    ];
    (mockSkillsService.findAll as any).mockResolvedValueOnce(list);

    const query = "query { findAllSkills { id name category } }";

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query })
      .expect(200);

    expect(res.body.data.findAllSkills).toEqual(list);
    expect(mockSkillsService.findAll).toHaveBeenCalled();
  });
});
