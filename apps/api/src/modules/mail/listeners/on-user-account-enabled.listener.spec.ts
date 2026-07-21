import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nContext } from "nestjs-i18n";
import { UserAccountEnabledEvent } from "@/core/events/user-account-enabled.event";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { OnUserAccountEnabledListener } from "./on-user-account-enabled.listener";

describe("OnUserAccountEnabledListener", () => {
  let listener: OnUserAccountEnabledListener;
  let emailProvider: jest.Mocked<Pick<EmailProvider, "send">>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(I18nContext, "current").mockReturnValue({
      t: jest.fn((key: string) => `translated:${key}`),
    } as unknown as I18nContext);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnUserAccountEnabledListener,
        {
          provide: EmailProvider,
          useValue: { send: jest.fn().mockResolvedValue({ id: "email_1" }) },
        },
      ],
    }).compile();

    listener = module.get(OnUserAccountEnabledListener);
    emailProvider = module.get(EmailProvider);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends html and text account-enabled email", async () => {
    await listener.handle(
      new UserAccountEnabledEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane"
      )
    );

    expect(emailProvider.send).toHaveBeenCalledWith({
      html: "translated:mail.ACCOUNT_ENABLED_HTML",
      subject: "translated:mail.ACCOUNT_ENABLED_SUBJECT",
      text: "translated:mail.ACCOUNT_ENABLED_TEXT",
      to: "jane@example.com",
    });
  });

  it("swallows EmailProvider errors", async () => {
    emailProvider.send.mockRejectedValue(new Error("resend down"));
    const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    await expect(
      listener.handle(
        new UserAccountEnabledEvent(
          "507f1f77bcf86cd799439013",
          "jane@example.com",
          "Jane"
        )
      )
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});
