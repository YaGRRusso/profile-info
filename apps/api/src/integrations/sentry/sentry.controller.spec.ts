import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { SentryController } from "./sentry.controller";

describe("SentryController", () => {
  async function createController(nodeEnv: string) {
    const module = await Test.createTestingModule({
      controllers: [SentryController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === "NODE_ENV") return nodeEnv;
              throw new Error(`Unexpected config key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    return module.get(SentryController);
  }

  it("returns 404 when not in production", async () => {
    const controller = await createController("development");

    expect(() => controller.smokeTest()).toThrow(NotFoundException);
  });

  it("throws a smoke-test error in production", async () => {
    const controller = await createController("production");

    expect(() => controller.smokeTest()).toThrow("Sentry Smoke Test");
  });
});
