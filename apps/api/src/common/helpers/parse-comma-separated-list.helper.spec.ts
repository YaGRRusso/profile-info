import { parseCommaSeparatedList } from "./parse-comma-separated-list.helper";

describe("parseCommaSeparatedList", () => {
  it("parses comma-separated values", () => {
    expect(parseCommaSeparatedList(" model-a , model-b ")).toEqual([
      "model-a",
      "model-b",
    ]);
  });

  it("returns an empty array when no values are present", () => {
    expect(parseCommaSeparatedList(" , , ")).toEqual([]);
  });
});
