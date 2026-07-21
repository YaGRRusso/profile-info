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
    jest.spyOn(I18nContext, "current").mockReturnValue({
      t: jest.fn((key: string) => `translated:${key}`),
    } as unknown as I18nContext);

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

  it("sends html and text registration email", async () => {
    await listener.handle(
      new UserRegisteredEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane"
      )
    );

    expect(emailProvider.send).toHaveBeenCalledWith({
      html: "translated:mail.REGISTERED_HTML",
      subject: "translated:mail.REGISTERED_SUBJECT",
      text: "translated:mail.REGISTERED_TEXT",
      to: "jane@example.com",
    });
  });

  it("swallows EmailProvider errors", async () => {
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
