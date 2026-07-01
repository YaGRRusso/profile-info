import { BadRequestException } from "@nestjs/common";
import {
  assertReferencesExist,
  assertReferencesResolved,
  REFERENCES_NOT_FOUND,
} from "./assert.helper";

describe("assert.helper", () => {
  describe("assertReferencesExist", () => {
    it("accepts when every requested id was found", () => {
      expect(() =>
        assertReferencesExist(["a", "b"], ["a", "b", "c"])
      ).not.toThrow();
    });

    it("accepts an empty requested list", () => {
      expect(() => assertReferencesExist([], ["a"])).not.toThrow();
    });

    it("rejects when any requested id is missing", () => {
      expect(() => assertReferencesExist(["a", "missing"], ["a"])).toThrow(
        new BadRequestException(REFERENCES_NOT_FOUND)
      );
    });

    it("deduplicates are not applied — caller must pass unique ids", () => {
      expect(() => assertReferencesExist(["a", "a"], ["a"])).not.toThrow();
    });
  });

  describe("assertReferencesResolved", () => {
    it("resolves ids via loader and asserts existence", async () => {
      const findById = jest
        .fn()
        .mockResolvedValue([{ id: "507f1f77bcf86cd799439011" }]);

      await expect(
        assertReferencesResolved(["507f1f77bcf86cd799439011"], findById)
      ).resolves.toBeUndefined();

      expect(findById).toHaveBeenCalledWith(["507f1f77bcf86cd799439011"]);
    });

    it("skips when requested ids are empty or undefined", async () => {
      const findById = jest.fn();

      await assertReferencesResolved(undefined, findById);
      await assertReferencesResolved([], findById);

      expect(findById).not.toHaveBeenCalled();
    });

    it("deduplicates requested ids before loading", async () => {
      const id = "507f1f77bcf86cd799439011";
      const findById = jest.fn().mockResolvedValue([{ id }]);

      await assertReferencesResolved([id, id], findById);

      expect(findById).toHaveBeenCalledWith([id]);
    });

    it("rejects when loader returns fewer matches", async () => {
      const findById = jest.fn().mockResolvedValue([]);

      await expect(
        assertReferencesResolved(["507f1f77bcf86cd799439011"], findById)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
