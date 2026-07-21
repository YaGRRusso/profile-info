import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nContext } from "nestjs-i18n";
import { UserRegisteredEvent } from "@/core/events/user-registered.event";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { OnUserRegisteredListener } from "./on-user-registered.listener";

describe("OnUserRegisteredListener", () => {
  let listener: OnUserRegisteredListener;
  let emailProvider: jest.Mocked<Pick<EmailProvider, "send">>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnUserRegisteredListener,
        {
          provide: EmailProvider,
          useValue: { send: jest.fn().mockResolvedValue({ id: "email_1" }) },
        },
      ],
    }).compile();

    listener = module.get(OnUserRegisteredListener);
    emailProvider = module.get(EmailProvider);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends the pt Resend template when request lang is pt", async () => {
    jest.spyOn(I18nContext, "current").mockReturnValue({
      lang: "pt",
    } as unknown as I18nContext);

    await listener.handle(
      new UserRegisteredEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane"
      )
    );

    expect(emailProvider.send).toHaveBeenCalledWith({
      template: {
        id: "register-pt",
        variables: { name: "Jane" },
      },
      to: "jane@example.com",
    });
  });

  it("falls back to register-en for other locales", async () => {
    jest.spyOn(I18nContext, "current").mockReturnValue({
      lang: "es",
    } as unknown as I18nContext);

    await listener.handle(
      new UserRegisteredEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane"
      )
    );

    expect(emailProvider.send).toHaveBeenCalledWith({
      template: {
        id: "register-en",
        variables: { name: "Jane" },
      },
      to: "jane@example.com",
    });
  });

  it("swallows EmailProvider errors", async () => {
    jest.spyOn(I18nContext, "current").mockReturnValue({
      lang: "en",
    } as unknown as I18nContext);
    emailProvider.send.mockRejectedValue(new Error("resend down"));
    const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    await expect(
      listener.handle(
        new UserRegisteredEvent(
          "507f1f77bcf86cd799439013",
          "jane@example.com",
          "Jane"
        )
      )
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});
