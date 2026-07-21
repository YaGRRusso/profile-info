export interface IntegrationEmailTemplate {
  id: string;
  variables?: Record<string, string | number>;
}

export interface IntegrationEmailMessage {
  from?: string;
  html?: string;
  replyTo?: string;
  subject?: string;
  template?: IntegrationEmailTemplate;
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
