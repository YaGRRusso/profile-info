import type { CreateEmailOptions } from "resend";
import type { IntegrationEmailMessage } from "../email.provider";

export function resendRequestMapper(
  message: IntegrationEmailMessage,
  from: string
): CreateEmailOptions {
  if (message.template) {
    return {
      from,
      replyTo: message.replyTo,
      subject: message.subject,
      template: {
        id: message.template.id,
        variables: message.template.variables,
      },
      to: message.to,
    } as CreateEmailOptions;
  }

  return {
    from,
    html: message.html,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    to: message.to,
  } as CreateEmailOptions;
}
