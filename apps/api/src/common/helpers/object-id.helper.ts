import { BadRequestException } from "@nestjs/common";
import { isValidObjectId } from "mongoose";

export function assertValidObjectId(id: string): void {
  if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");
}

export function assertValidObjectIds(ids: string[]): void {
  if (ids.some((id) => !isValidObjectId(id)))
    throw new BadRequestException("Invalid ID");
}
