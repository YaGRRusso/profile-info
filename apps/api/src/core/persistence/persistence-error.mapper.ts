import {
  BadRequestException,
  ConflictException,
  type HttpException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";
import { i18nKey } from "@/core/i18n/i18n";

export function mapPersistenceError(error: unknown): HttpException | undefined {
  if (error instanceof MongoServerError) {
    if (error.code === 11_000 || error.code === 11_001) {
      return new ConflictException(i18nKey("persistence.DUPLICATE"));
    }

    if (error.code === 121) {
      return new BadRequestException(i18nKey("persistence.VALIDATION"));
    }
  }

  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestException(i18nKey("persistence.INVALID"));
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new BadRequestException(i18nKey("persistence.VALIDATION"));
  }

  if (error instanceof mongoose.Error.MongooseServerSelectionError) {
    return new ServiceUnavailableException(i18nKey("persistence.UNAVAILABLE"));
  }
}
