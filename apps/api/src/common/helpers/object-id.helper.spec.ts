import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";
import { COMMON_INVALID_ID } from "@/core/errors/common.messages";
import { assertValidObjectId, assertValidObjectIds } from "./object-id.helper";

describe("object-id.helper", () => {
  describe("assertValidObjectId", () => {
    it("accepts a valid ObjectId string", () => {
      const id = new mongoose.Types.ObjectId().toHexString();

      expect(() => assertValidObjectId(id)).not.toThrow();
    });

    it("rejects an invalid ObjectId string", () => {
      expect.assertions(2);

      try {
        assertValidObjectId("not-an-object-id");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        if (error instanceof BadRequestException) {
          expect(error.getResponse()).toEqual(COMMON_INVALID_ID);
        }
      }
    });
  });

  describe("assertValidObjectIds", () => {
    it("accepts valid ObjectId strings", () => {
      const ids = [
        new mongoose.Types.ObjectId().toHexString(),
        new mongoose.Types.ObjectId().toHexString(),
      ];

      expect(() => assertValidObjectIds(ids)).not.toThrow();
    });

    it("accepts an empty array", () => {
      expect(() => assertValidObjectIds([])).not.toThrow();
    });

    it("rejects when any id is invalid", () => {
      const validId = new mongoose.Types.ObjectId().toHexString();

      expect(() => assertValidObjectIds([validId, "bad-id"])).toThrow(
        BadRequestException
      );
    });
  });
});
