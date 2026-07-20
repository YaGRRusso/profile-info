import { BadRequestException } from "@nestjs/common";
import { isValidObjectId } from "mongoose";
import { i18nKey } from "@/core/i18n/i18n";

export function assertValidObjectId(id: string): void {
  if (!isValidObjectId(id))
    throw new BadRequestException(i18nKey("common.INVALID_ID"));
}

export function assertValidObjectIds(ids: string[]): void {
  if (ids.some((id) => !isValidObjectId(id))) {
    throw new BadRequestException(i18nKey("common.INVALID_ID"));
  }
}
