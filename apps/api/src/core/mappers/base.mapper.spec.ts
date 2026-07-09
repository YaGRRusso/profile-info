import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";
import { toObjectId, toObjectIds } from "./base.mapper";

describe("base.mapper", () => {
  describe("toObjectId", () => {
    it("converts a valid id string", () => {
      const id = new mongoose.Types.ObjectId().toHexString();

      expect(toObjectId(id)).toEqual(new mongoose.Types.ObjectId(id));
    });

    it("rejects an invalid id string", () => {
      expect(() => toObjectId("invalid-id")).toThrow(BadRequestException);
    });
  });

  describe("toObjectIds", () => {
    it("converts valid id strings", () => {
      const ids = [
        new mongoose.Types.ObjectId().toHexString(),
        new mongoose.Types.ObjectId().toHexString(),
      ];

      expect(toObjectIds(ids)).toEqual(
        ids.map((id) => new mongoose.Types.ObjectId(id))
      );
    });

    it("returns undefined when values are undefined", () => {
      expect(toObjectIds(undefined)).toBeUndefined();
    });

    it("rejects when any id is invalid", () => {
      const validId = new mongoose.Types.ObjectId().toHexString();

      expect(() => toObjectIds([validId, "bad-id"])).toThrow(
        BadRequestException
      );
    });
  });
});
