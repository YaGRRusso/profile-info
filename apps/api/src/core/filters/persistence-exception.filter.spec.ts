import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";
import { Error as MongooseError } from "mongoose";
import { PersistenceExceptionFilter } from "./persistence-exception.filter";

function makeDuplicateKeyError(keyValue: Record<string, unknown>) {
  const error = new MongoServerError({
    message: "E11000 duplicate key",
  });
  error.code = 11_000;
  error.keyValue = keyValue;
  return error;
}

describe("PersistenceExceptionFilter", () => {
  const filter = new PersistenceExceptionFilter();
  const host = {} as Parameters<PersistenceExceptionFilter["catch"]>[1];

  describe("MongoServerError", () => {
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

    it("should map E11001 to ConflictException", () => {
      const error = new MongoServerError({ message: "E11001 duplicate key" });
      error.code = 11_001;
      error.keyValue = { email: "taken@example.com" };

      const result = filter.catch(error, host);

      expect(result).toBeInstanceOf(ConflictException);
      expect(result.getResponse()).toMatchObject({
        message: "A record with this email already exists.",
        statusCode: 409,
      });
    });

    it("should map code 121 to BadRequestException", () => {
      const error = new MongoServerError({
        message: "Document failed validation",
      });
      error.code = 121;

      const result = filter.catch(error, host);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toMatchObject({
        message: "Document failed validation",
        statusCode: 400,
      });
    });

    it("should return unmapped MongoServerError as-is", () => {
      const error = new MongoServerError({ message: "connection failed" });
      error.code = 6;

      expect(filter.catch(error, host)).toBe(error);
    });
  });

  describe("Mongoose CastError", () => {
    it("should map CastError to BadRequestException", () => {
      const error = new MongooseError.CastError("ObjectId", "not-an-id", "_id");

      const result = filter.catch(error, host);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toMatchObject({
        message: 'Invalid value for field "_id".',
        statusCode: 400,
      });
    });
  });

  describe("Mongoose ValidationError", () => {
    it("should map ValidationError to BadRequestException", () => {
      const error = new MongooseError.ValidationError();
      error.addError(
        "name",
        new MongooseError.ValidatorError({
          path: "name",
          message: "Path `name` is required.",
        })
      );

      const result = filter.catch(error, host);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toMatchObject({
        message: "Path `name` is required.",
        statusCode: 400,
      });
    });
  });

  describe("MongooseServerSelectionError", () => {
    it("should map to ServiceUnavailableException", () => {
      const error = new MongooseError.MongooseServerSelectionError(
        "connect ECONNREFUSED"
      );

      const result = filter.catch(error, host);

      expect(result).toBeInstanceOf(ServiceUnavailableException);
      expect(result.getResponse()).toMatchObject({
        message: "Database temporarily unavailable.",
        statusCode: 503,
      });
    });
  });
});
