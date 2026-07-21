import { Test, TestingModule } from "@nestjs/testing";
import { ResendService } from "./resend.service";

describe("ResendService", () => {
  it("no-ops without calling Resend", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResendService],
    }).compile();

    const service = module.get(ResendService);

    await expect(
      service.send({
        subject: "Hello",
        text: "Hi",
        to: "user@example.com",
      })
    ).resolves.toEqual({ id: "disabled" });
  });
});
