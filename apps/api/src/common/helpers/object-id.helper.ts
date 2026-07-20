import { BadRequestException } from "@nestjs/common";
import { isValidObjectId } from "mongoose";
import { i18nKey } from "@/core/i18n/i18n";

export function assertValidObjectId(id: string): void {
  if (!isValidObjectId(id))
    throw new BadRequestException(i18nKey("common.INVALID_ID", { id }));
}

export function assertValidObjectIds(ids: string[]): void {
  const invalid = ids.find((id) => !isValidObjectId(id));
  if (invalid !== undefined) {
    throw new BadRequestException(
      i18nKey("common.INVALID_ID", { id: invalid })
    );
  }
}
