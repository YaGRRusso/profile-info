import { Injectable } from "@nestjs/common";
import {
  EmailProvider,
  type IntegrationEmailMessage,
  type IntegrationEmailResult,
} from "./email.provider";

@Injectable()
export class ResendService extends EmailProvider {
  send(_message: IntegrationEmailMessage): Promise<IntegrationEmailResult> {
    return Promise.resolve({ id: "disabled" });
  }
}
