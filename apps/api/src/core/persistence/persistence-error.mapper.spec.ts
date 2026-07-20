import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";
import { mapPersistenceError } from "./persistence-error.mapper";

describe("mapPersistenceError", () => {
  it("maps duplicate keys with field and value from keyValue", () => {
    const error = new MongoServerError({ message: "duplicate key" });
    error.code = 11_000;
    Reflect.set(error, "keyValue", { email: "a@b.com" });

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({
        args: { field: "email", value: "a@b.com" },
        message: "persistence.DUPLICATE",
      })
    );
  });

  it("maps duplicate keys without keyValue to the generic message", () => {
    const error = new MongoServerError({ message: "duplicate key" });
    error.code = 11_000;

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.DUPLICATE_GENERIC" })
    );
  });

  it("maps duplicate keys with non-scalar keyValue to the generic message", () => {
    const error = new MongoServerError({ message: "duplicate key" });
    error.code = 11_000;
    Reflect.set(error, "keyValue", { meta: { nested: true } });

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.DUPLICATE_GENERIC" })
    );
  });

  it("maps document validation failures", () => {
    const error = new MongoServerError({ message: "validation failed" });
    error.code = 121;

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.VALIDATION_GENERIC" })
    );
  });

  it("maps invalid values with field and value", () => {
    const error = new mongoose.Error.CastError("ObjectId", "invalid", "_id");
    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({
        args: { field: "_id", value: "invalid" },
        message: "persistence.INVALID",
      })
    );
  });

  it("maps Mongoose validation failures with details", () => {
    const error = new mongoose.Error.ValidationError();
    error.addError(
      "email",
      new mongoose.Error.ValidatorError({ message: "email is required" })
    );

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({
        args: { details: "email is required" },
        message: "persistence.VALIDATION",
      })
    );
  });

  it("maps empty Mongoose validation failures to the generic key", () => {
    const result = mapPersistenceError(new mongoose.Error.ValidationError());

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.VALIDATION_GENERIC" })
    );
  });

  it("maps unavailable database errors", () => {
    const error = new mongoose.Error.MongooseServerSelectionError(
      "connect ECONNREFUSED"
    );
    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(ServiceUnavailableException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.UNAVAILABLE" })
    );
  });

  it("ignores unrelated errors", () => {
    expect(mapPersistenceError(new Error("boom"))).toBeUndefined();
  });
});
