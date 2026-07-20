import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ErrorMonitoringProvider } from "./error-monitoring.provider";
import { SentryController } from "./sentry.controller";

describe("SentryController", () => {
  async function createController(enabled: boolean) {
    const module = await Test.createTestingModule({
      controllers: [SentryController],
      providers: [
        {
          provide: ErrorMonitoringProvider,
          useValue: { enabled },
        },
      ],
    }).compile();

    return module.get(SentryController);
  }

  it("returns 404 when Sentry is disabled", async () => {
    const controller = await createController(false);

    expect(() => controller.smokeTest()).toThrow(NotFoundException);
  });

  it("throws a smoke-test error when Sentry is enabled", async () => {
    const controller = await createController(true);

    expect(() => controller.smokeTest()).toThrow("Sentry smoke test");
  });
});
