export interface IntegrationEmailMessage {
  from?: string;
  html?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  to: string | string[];
}

export interface IntegrationEmailResult {
  id: string;
}

export abstract class EmailProvider {
  abstract send(
    message: IntegrationEmailMessage
  ): Promise<IntegrationEmailResult>;
}
