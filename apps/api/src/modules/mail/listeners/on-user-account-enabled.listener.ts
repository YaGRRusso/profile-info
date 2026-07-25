import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { I18nService } from "nestjs-i18n";
import { DomainEvents } from "@/core/events/domain-events";
import { UserAccountEnabledEvent } from "@/core/events/user-account-enabled.event";
import { i18nKey } from "@/core/i18n/i18n";
import type { I18nPath } from "@/generated/i18n.generated";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { escapeHtml } from "../helpers/escape-html.helper";
import { formatMailError } from "../helpers/format-mail-error.helper";

@Injectable()
export class OnUserAccountEnabledListener {
  private readonly logger = new Logger(OnUserAccountEnabledListener.name);

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly i18n: I18nService
  ) {}

  @OnEvent(DomainEvents.user.accountEnabled)
  async handle(event: UserAccountEnabledEvent) {
    const translate = (key: I18nPath, args?: Record<string, unknown>) =>
      this.i18n.t(key, { args, lang: event.locale }) as string;

    try {
      await this.emailProvider.send({
        html: translate(i18nKey("mail.ACCOUNT_ENABLED_HTML"), {
          name: escapeHtml(event.name),
        }),
        subject: translate(i18nKey("mail.ACCOUNT_ENABLED_SUBJECT")),
        text: translate(i18nKey("mail.ACCOUNT_ENABLED_TEXT"), {
          name: event.name,
        }),
        to: event.email,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send account-enabled email to ${event.email}: ${formatMailError(error)}`
      );
    }
  }
}
