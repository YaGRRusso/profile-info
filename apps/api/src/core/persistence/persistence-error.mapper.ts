import {
  BadRequestException,
  ConflictException,
  type HttpException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";
import {
  PERSISTENCE_DUPLICATE,
  PERSISTENCE_INVALID,
  PERSISTENCE_UNAVAILABLE,
  PERSISTENCE_VALIDATION,
} from "./persistence.messages";

export function mapPersistenceError(error: unknown): HttpException | undefined {
  if (error instanceof MongoServerError) {
    if (error.code === 11_000 || error.code === 11_001) {
      return new ConflictException(PERSISTENCE_DUPLICATE);
    }

    if (error.code === 121) {
      return new BadRequestException(PERSISTENCE_VALIDATION);
    }
  }

  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestException(PERSISTENCE_INVALID);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new BadRequestException(PERSISTENCE_VALIDATION);
  }

  if (error instanceof mongoose.Error.MongooseServerSelectionError) {
    return new ServiceUnavailableException(PERSISTENCE_UNAVAILABLE);
  }
}
