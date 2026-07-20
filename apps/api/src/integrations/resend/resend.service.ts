import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { Env } from "@/core/configs/env.validation";
import {
  EmailProvider,
  type IntegrationEmailMessage,
  type IntegrationEmailResult,
} from "./email.provider";
import { mapResendError } from "./mappers/resend-error.mapper";
import { resendRequestMapper } from "./mappers/resend-request.mapper";
import { resendResultMapper } from "./mappers/resend-result.mapper";
import {
  EMAIL_FROM_REQUIRED,
  EMAIL_NOT_CONFIGURED,
  EMAIL_PROVIDER_FAILURE,
} from "./resend.messages";

@Injectable()
export class ResendService extends EmailProvider {
  private readonly client: Resend | null;
  private readonly defaultFrom: string | undefined;

  constructor(config: ConfigService<Env, true>) {
    super();

    const apiKey = config.get("RESEND_API_KEY");
    this.defaultFrom = config.get("EMAIL_FROM");
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async send(
    message: IntegrationEmailMessage
  ): Promise<IntegrationEmailResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(EMAIL_NOT_CONFIGURED);
    }

    const from = message.from ?? this.defaultFrom;
    if (!from) {
      throw new BadRequestException(EMAIL_FROM_REQUIRED);
    }

    try {
      const { data, error } = await this.client.emails.send(
        resendRequestMapper(message, from)
      );

      if (error) {
        throw mapResendError(error);
      }

      if (!data) {
        throw new BadGatewayException(EMAIL_PROVIDER_FAILURE);
      }

      return resendResultMapper(data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw mapResendError(error);
    }
  }
}
