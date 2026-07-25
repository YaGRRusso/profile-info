import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEvents } from "@/core/events/domain-events";
import { UserRegisteredEvent } from "@/core/events/user-registered.event";
import { EmailProvider } from "@/integrations/resend/email.provider";
import { registerMailTemplateId } from "../const/resend-mail-templates.const";
import { formatMailError } from "../helpers/format-mail-error.helper";

@Injectable()
export class OnUserRegisteredListener {
  private readonly logger = new Logger(OnUserRegisteredListener.name);

  constructor(private readonly emailProvider: EmailProvider) {}

  @OnEvent(DomainEvents.user.registered)
  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailProvider.send({
        template: {
          id: registerMailTemplateId(event.locale),
          variables: { name: event.name },
        },
        to: event.email,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send registration email to ${event.email}: ${formatMailError(error)}`
      );
    }
  }
}
