import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { App } from "supertest/types";
import { validationConfig } from "@/core/configs/validation.config";
import { UserRole } from "@/core/enums/user-role.enum";
import { AiChatProvider } from "@/integrations/open-router/ai-chat.provider";
import { AiToolsModule } from "@/modules/ai-tools/ai-tools.module";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { graphqlRequest } from "../support/graphql-request";
import { TestAppModule } from "../support/test-app.module";

const TRANSLATE_MUTATION = `
  mutation Translate($translateInput: TranslateInput!) {
    translate(translateInput: $translateInput) {
      messages {
        message {
          content
        }
      }
    }
  }
`;

const mockChatResult = {
  messages: [
    {
      finishReason: "stop",
      message: { role: "assistant", content: "Olá" },
    },
  ],
  usage: {
    promptTokens: 1,
    completionTokens: 1,
    totalTokens: 2,
  },
};

async function createAiToolsTestApp(): Promise<{
  app: INestApplication<App>;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule({
    imports: [
      TestAppModule,
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
      AiToolsModule,
    ],
  })
    .overrideProvider(AiChatProvider)
    .useValue({
      chat: jest.fn().mockResolvedValue(mockChatResult),
    })
    .compile();

  const app = module.createNestApplication({ logger: false });
  validationConfig(app);
  await app.init();

  return { app, module };
}

describe("Ai tools (e2e)", () => {
  let app: INestApplication<App>;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createAiToolsTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);

    await usersService.createOne({
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.SUPER_ADMIN,
    });

    await usersService.createOne({
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "alice.pass",
      role: UserRole.USER,
    });

    const signIn = async (email: string, password: string) => {
      const response = await graphqlRequest<{ signIn: string }>(app, {
        query: `
          mutation SignIn($signInInput: SignInInput!) {
            signIn(signInInput: $signInInput)
          }
        `,
        variables: { signInInput: { email, password } },
      });
      return response.data?.signIn ?? "";
    };

    adminToken = await signIn("admin@profile.info", "pass.123");
    userToken = await signIn("alice@profile.info", "alice.pass");
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("should return UNAUTHENTICATED for translate without a token", async () => {
    const response = await graphqlRequest(app, {
      query: TRANSLATE_MUTATION,
      variables: {
        translateInput: { raw: "Hello", targetLanguage: "pt" },
      },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should allow USER to call translate", async () => {
    const response = await graphqlRequest<{
      translate: { messages: Array<{ message: { content: string } }> };
    }>(app, {
      query: TRANSLATE_MUTATION,
      variables: {
        translateInput: { raw: "Hello", targetLanguage: "pt" },
      },
      token: userToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.translate.messages[0].message.content).toBe("Olá");
  });

  it("should allow SUPER_ADMIN to call translate", async () => {
    const response = await graphqlRequest<{
      translate: { messages: Array<{ message: { content: string } }> };
    }>(app, {
      query: TRANSLATE_MUTATION,
      variables: {
        translateInput: { raw: "Hello", targetLanguage: "pt" },
      },
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.translate.messages[0].message.content).toBe("Olá");
  });
});
