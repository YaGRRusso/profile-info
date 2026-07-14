import mongoose from "mongoose";
import { withObjectIdRefs } from "./filter-ref.helper";

interface TestFilter {
  organizationId?: string;
  skillIds?: string[];
  slug?: string;
}

interface TestModel {
  organizationId: mongoose.Types.ObjectId;
  skillIds: mongoose.Types.ObjectId[];
  slug: string;
}

describe("withObjectIdRefs", () => {
  const organizationId = new mongoose.Types.ObjectId().toHexString();
  const skillIds = [
    new mongoose.Types.ObjectId().toHexString(),
    new mongoose.Types.ObjectId().toHexString(),
  ];

  it("should convert single and array ObjectId refs", () => {
    const filter = withObjectIdRefs<TestFilter, TestModel>(
      { organizationId, skillIds, slug: "bootcamp" },
      { array: ["skillIds"], single: ["organizationId"] }
    );

    expect(filter.organizationId).toEqual(
      new mongoose.Types.ObjectId(organizationId)
    );
    expect(filter.skillIds).toEqual(
      skillIds.map((id) => new mongoose.Types.ObjectId(id))
    );
    expect(filter.slug).toBe("bootcamp");
  });

  it("should leave non-string ref values unchanged", () => {
    const filter = withObjectIdRefs<TestFilter, TestModel>(
      { slug: "bootcamp" },
      { array: ["skillIds"], single: ["organizationId"] }
    );

    expect(filter).toEqual({ slug: "bootcamp" });
  });

  it("should not mutate the input object", () => {
    const entity = { organizationId, slug: "bootcamp" };

    withObjectIdRefs(entity, { single: ["organizationId"] });

    expect(entity.organizationId).toBe(organizationId);
  });

  it("should reject invalid ObjectId refs", () => {
    expect(() =>
      withObjectIdRefs<TestFilter, TestModel>(
        { organizationId: "not-an-object-id" },
        { single: ["organizationId"] }
      )
    ).toThrow("Invalid ID");
  });
});
