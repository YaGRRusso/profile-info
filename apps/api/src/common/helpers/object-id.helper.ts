import { BadRequestException } from "@nestjs/common";
import { isValidObjectId } from "mongoose";
import { COMMON_INVALID_ID } from "@/core/errors/common.messages";

export function assertValidObjectId(id: string): void {
  if (!isValidObjectId(id)) throw new BadRequestException(COMMON_INVALID_ID);
}

export function assertValidObjectIds(ids: string[]): void {
  if (ids.some((id) => !isValidObjectId(id))) {
    throw new BadRequestException(COMMON_INVALID_ID);
  }
}
