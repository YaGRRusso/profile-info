import type { CreateEmailResponseSuccess } from "resend";
import type { IntegrationEmailResult } from "../email.provider";

export function resendResultMapper(
  data: CreateEmailResponseSuccess
): IntegrationEmailResult {
  return { id: data.id };
}
