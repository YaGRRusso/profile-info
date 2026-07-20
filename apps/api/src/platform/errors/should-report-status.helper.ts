import { HttpStatus } from "@nestjs/common";

export function shouldReportStatus(statusCode: number): boolean {
  return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
}
