import { ConflictException } from "@nestjs/common";
import { MongoServerError } from "mongodb";
import { MongoExceptionFilter } from "./mongo-exception.filter";

function makeDuplicateKeyError(keyValue: Record<string, unknown>) {
  const error = new MongoServerError({
    message: "E11000 duplicate key",
  });
  error.code = 11_000;
  error.keyValue = keyValue;
  return error;
}

describe("MongoExceptionFilter", () => {
  const filter = new MongoExceptionFilter();
  const host = {} as Parameters<MongoExceptionFilter["catch"]>[1];

  it("should map E11000 to ConflictException", () => {
    const result = filter.catch(
      makeDuplicateKeyError({ slug: "typescript" }),
      host
    );

    expect(result).toBeInstanceOf(ConflictException);
    expect(result.getResponse()).toMatchObject({
      message: "A record with this slug already exists.",
      statusCode: 409,
    });
  });

  it("should fall back to value when keyValue is empty", () => {
    const result = filter.catch(makeDuplicateKeyError({}), host);

    expect(result).toBeInstanceOf(ConflictException);
    expect(result.getResponse()).toMatchObject({
      message: "A record with this value already exists.",
      statusCode: 409,
    });
  });

  it("should return the original error for non-duplicate Mongo errors", () => {
    const error = new MongoServerError({ message: "connection failed" });
    error.code = 6;

    expect(filter.catch(error, host)).toBe(error);
  });
});
