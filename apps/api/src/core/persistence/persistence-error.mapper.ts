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
      const duplicate = duplicateArgs(error);
      if (duplicate) {
        return new ConflictException(
          i18nKey("persistence.DUPLICATE", duplicate)
        );
      }
      return new ConflictException(i18nKey("persistence.DUPLICATE_GENERIC"));
    }

    if (error.code === 121) {
      return new BadRequestException(i18nKey("persistence.VALIDATION_GENERIC"));
    }
  }

  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestException(
      i18nKey("persistence.INVALID", {
        field: error.path,
        value: String(error.value),
      })
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = validationDetails(error);
    if (details) {
      return new BadRequestException(
        i18nKey("persistence.VALIDATION", { details })
      );
    }
    return new BadRequestException(i18nKey("persistence.VALIDATION_GENERIC"));
  }

  if (error instanceof mongoose.Error.MongooseServerSelectionError) {
    return new ServiceUnavailableException(i18nKey("persistence.UNAVAILABLE"));
  }
}

function duplicateArgs(
  error: MongoServerError
): { field: string; value: string } | undefined {
  const keyValue = Reflect.get(error, "keyValue");
  if (!keyValue || typeof keyValue !== "object" || Array.isArray(keyValue)) {
    return;
  }

  const [field, raw] =
    Object.entries(keyValue as Record<string, unknown>)[0] ?? [];
  if (!field) return;
  if (
    typeof raw !== "string" &&
    typeof raw !== "number" &&
    typeof raw !== "boolean"
  ) {
    return;
  }

  return { field, value: String(raw) };
}

function validationDetails(
  error: mongoose.Error.ValidationError
): string | undefined {
  const messages = Object.values(error.errors ?? {})
    .map((entry) => entry?.message)
    .filter((message): message is string => Boolean(message));

  if (messages.length === 0) return;

  return messages.slice(0, 3).join("; ").slice(0, 200) || undefined;
}
