import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { Locale } from "@/core/enums/locale.enum";
import { UserAccountEnabledEvent } from "@/core/events/user-account-enabled.event";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { OnUserAccountEnabledListener } from "./on-user-account-enabled.listener";

describe("OnUserAccountEnabledListener", () => {
  let listener: OnUserAccountEnabledListener;
  let emailProvider: jest.Mocked<Pick<EmailProvider, "send">>;
  let i18n: jest.Mocked<Pick<I18nService, "t">>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnUserAccountEnabledListener,
        {
          provide: EmailProvider,
          useValue: { send: jest.fn().mockResolvedValue({ id: "email_1" }) },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn(
              (key: string, options?: { lang?: string }) =>
                `translated:${key}:${options?.lang ?? "default"}`
            ),
          },
        },
      ],
    }).compile();

    listener = module.get(OnUserAccountEnabledListener);
    emailProvider = module.get(EmailProvider);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("translates the account-enabled email with the user locale", async () => {
    await listener.handle(
      new UserAccountEnabledEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane",
        Locale.pt
      )
    );

    expect(emailProvider.send).toHaveBeenCalledWith({
      html: "translated:mail.ACCOUNT_ENABLED_HTML:pt",
      subject: "translated:mail.ACCOUNT_ENABLED_SUBJECT:pt",
      text: "translated:mail.ACCOUNT_ENABLED_TEXT:pt",
      to: "jane@example.com",
    });
  });

  it("lets i18n fall back when the user has no locale", async () => {
    await listener.handle(
      new UserAccountEnabledEvent(
        "507f1f77bcf86cd799439013",
        "jane@example.com",
        "Jane"
      )
    );

    expect(i18n.t).toHaveBeenCalledWith(
      "mail.ACCOUNT_ENABLED_SUBJECT",
      expect.objectContaining({ lang: undefined })
    );
  });

  it("swallows EmailProvider errors", async () => {
    emailProvider.send.mockRejectedValue(new Error("resend down"));
    const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    await expect(
      listener.handle(
        new UserAccountEnabledEvent(
          "507f1f77bcf86cd799439013",
          "jane@example.com",
          "Jane",
          Locale.en
        )
      )
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});
