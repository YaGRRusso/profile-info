import type { ArgumentsHost } from "@nestjs/common";
import {
  BadRequestException,
  Catch,
  ConflictException,
  type ExceptionFilter,
  ServiceUnavailableException,
} from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";
import { MongoServerError } from "mongodb";
import { Error as MongooseError } from "mongoose";

type PersistenceError =
  | MongoServerError
  | MongooseError.CastError
  | MongooseError.ValidationError
  | MongooseError.MongooseServerSelectionError;

@Catch(
  MongoServerError,
  MongooseError.CastError,
  MongooseError.ValidationError,
  MongooseError.MongooseServerSelectionError
)
export class PersistenceExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: PersistenceError, _host: ArgumentsHost) {
    if (exception instanceof MongoServerError) {
      return mapMongoServerError(exception);
    }

    if (exception instanceof MongooseError.CastError) {
      return new BadRequestException(
        `Invalid value for field "${exception.path}".`
      );
    }

    if (exception instanceof MongooseError.ValidationError) {
      return new BadRequestException(formatValidationError(exception));
    }

    if (exception instanceof MongooseError.MongooseServerSelectionError) {
      return new ServiceUnavailableException(
        "Database temporarily unavailable."
      );
    }

    return exception;
  }
}

function mapMongoServerError(exception: MongoServerError) {
  switch (exception.code) {
    case 11_000:
    case 11_001:
      return new ConflictException(
        `A record with this ${extractDuplicateField(exception)} already exists.`
      );
    case 121:
      return new BadRequestException(
        exception.message || "Document failed validation."
      );
    default:
      return exception;
  }
}

function extractDuplicateField(error: MongoServerError): string {
  const keys = Object.keys(error.keyValue ?? {});
  return keys[0] ?? "value";
}

function formatValidationError(error: MongooseError.ValidationError): string {
  const [first] = Object.values(error.errors);
  return first?.message ?? "Validation failed.";
}
