import { toPersistenceSort } from "./sort-ref.helper";

interface TestSort {
  relevance?: -1 | 1;
  slug?: -1 | 1;
}

interface TestModel {
  relevance: number;
  slug: string;
}

describe("toPersistenceSort", () => {
  it("should pass through sort fields", () => {
    expect(toPersistenceSort<TestSort, TestModel>({ relevance: -1 })).toEqual({
      relevance: -1,
    });
  });

  it("should not mutate the input object", () => {
    const entity = { relevance: -1 as const };

    toPersistenceSort(entity);

    expect(entity).toEqual({ relevance: -1 });
  });
});
