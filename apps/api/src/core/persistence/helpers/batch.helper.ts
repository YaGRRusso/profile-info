import type { HttpException } from "@nestjs/common";
import type { BatchCount } from "../types/output.type";

export function assertBatchSucceeded(
  count: BatchCount,
  exception: HttpException
): BatchCount {
  if (count.succeeded === 0) {
    throw exception;
  }

  return count;
}
