import type { CreateEmailOptions } from "resend";
import type { IntegrationEmailMessage } from "../email.provider";

export function resendRequestMapper(
  message: IntegrationEmailMessage,
  from: string
): CreateEmailOptions {
  return {
    from,
    html: message.html,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    to: message.to,
  } as CreateEmailOptions;
}
