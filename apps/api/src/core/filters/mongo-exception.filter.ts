import type { ArgumentsHost } from "@nestjs/common";
import { Catch, ConflictException, type ExceptionFilter } from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";
import { MongoServerError } from "mongodb";

@Catch(MongoServerError)
export class MongoExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: MongoServerError, _host: ArgumentsHost) {
    if (exception.code === 11_000) {
      const field = extractDuplicateField(exception);
      return new ConflictException(
        `A record with this ${field} already exists.`
      );
    }

    return exception;
  }
}

function extractDuplicateField(error: MongoServerError): string {
  const keys = Object.keys(error.keyValue ?? {});
  return keys[0] ?? "value";
}
