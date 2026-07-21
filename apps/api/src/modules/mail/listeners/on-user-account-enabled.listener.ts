import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserAccountEnabledEvent } from "@/core/events/user-account-enabled.event";
import { t } from "@/core/i18n/i18n";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { escapeHtml } from "../helpers/escape-html.helper";

@Injectable()
export class OnUserAccountEnabledListener {
  private readonly logger = new Logger(OnUserAccountEnabledListener.name);

  constructor(private readonly emailProvider: EmailProvider) {}

  @OnEvent(DomainEvents.user.accountEnabled)
  async handle(event: UserAccountEnabledEvent) {
    try {
      await this.emailProvider.send({
        html: t("mail.ACCOUNT_ENABLED_HTML", {
          name: escapeHtml(event.name),
        }),
        subject: t("mail.ACCOUNT_ENABLED_SUBJECT"),
        text: t("mail.ACCOUNT_ENABLED_TEXT", { name: event.name }),
        to: event.email,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send account-enabled email to ${event.email}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
