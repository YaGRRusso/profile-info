import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";
import {
  toIdString,
  toIdStrings,
  toObjectId,
  toObjectIds,
} from "./base.mapper";

describe("base.mapper", () => {
  describe("toIdString", () => {
    it("preserves null and undefined", () => {
      expect(toIdString(null)).toBeNull();
      expect(toIdString(undefined)).toBeUndefined();
    });

    it("stringifies object ids and plain strings", () => {
      const id = new mongoose.Types.ObjectId();

      expect(toIdString(id)).toBe(String(id));
      expect(toIdString(id.toHexString())).toBe(id.toHexString());
    });
  });

  describe("toIdStrings", () => {
    it("preserves null and undefined", () => {
      expect(toIdStrings(undefined)).toBeUndefined();
      expect(toIdStrings(null)).toBeNull();
    });

    it("stringifies id values", () => {
      const id = new mongoose.Types.ObjectId();

      expect(toIdStrings([id, "abc"])).toEqual([String(id), "abc"]);
    });
  });

  describe("toObjectId", () => {
    it("preserves null and undefined", () => {
      expect(toObjectId(null)).toBeNull();
      expect(toObjectId(undefined)).toBeUndefined();
    });

    it("converts a valid id string", () => {
      const id = new mongoose.Types.ObjectId().toHexString();

      expect(toObjectId(id)).toEqual(new mongoose.Types.ObjectId(id));
    });

    it("rejects an invalid id string", () => {
      expect(() => toObjectId("invalid-id")).toThrow(BadRequestException);
    });
  });

  describe("toObjectIds", () => {
    it("preserves null and undefined", () => {
      expect(toObjectIds(undefined)).toBeUndefined();
      expect(toObjectIds(null)).toBeNull();
    });

    it("converts valid id strings", () => {
      const ids = [
        new mongoose.Types.ObjectId().toHexString(),
        new mongoose.Types.ObjectId().toHexString(),
      ];

      expect(toObjectIds(ids)).toEqual(
        ids.map((id) => new mongoose.Types.ObjectId(id))
      );
    });

    it("rejects when any id is invalid", () => {
      const validId = new mongoose.Types.ObjectId().toHexString();

      expect(() => toObjectIds([validId, "bad-id"])).toThrow(
        BadRequestException
      );
    });
  });
});
