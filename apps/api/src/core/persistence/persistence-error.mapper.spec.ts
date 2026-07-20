import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";
import { mapPersistenceError } from "./persistence-error.mapper";

describe("mapPersistenceError", () => {
  it("maps duplicate keys", () => {
    const error = new MongoServerError({ message: "duplicate key" });
    error.code = 11_000;

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.DUPLICATE" })
    );
  });

  it("maps document validation failures", () => {
    const error = new MongoServerError({ message: "validation failed" });
    error.code = 121;

    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.VALIDATION" })
    );
  });

  it("maps invalid values", () => {
    const error = new mongoose.Error.CastError("ObjectId", "invalid", "_id");
    const result = mapPersistenceError(error);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.INVALID" })
    );
  });

  it("maps Mongoose validation failures", () => {
    const result = mapPersistenceError(new mongoose.Error.ValidationError());

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toEqual(
      expect.objectContaining({ message: "persistence.VALIDATION" })
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
