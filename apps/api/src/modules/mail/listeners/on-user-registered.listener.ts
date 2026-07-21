import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserRegisteredEvent } from "@/core/events/user-registered.event";
import { t } from "@/core/i18n/i18n";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { escapeHtml } from "../helpers/escape-html.helper";

@Injectable()
export class OnUserRegisteredListener {
  private readonly logger = new Logger(OnUserRegisteredListener.name);

  constructor(private readonly emailProvider: EmailProvider) {}

  @OnEvent(DomainEvents.user.registered)
  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailProvider.send({
        html: t("mail.REGISTERED_HTML", { name: escapeHtml(event.name) }),
        subject: t("mail.REGISTERED_SUBJECT"),
        text: t("mail.REGISTERED_TEXT", { name: event.name }),
        to: event.email,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send registration email to ${event.email}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
