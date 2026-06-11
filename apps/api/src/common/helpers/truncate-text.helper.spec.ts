import { truncateText } from "./truncate-text.helper";

describe("truncateText", () => {
  it("returns the original text when it fits within the limit", () => {
    expect(truncateText("short text", 20)).toBe("short text");
  });

  it("truncates at the last word boundary before the limit", () => {
    const text = "desenvolvimento de APIs GraphQL com NestJS";

    expect(truncateText(text, 30)).toBe("desenvolvimento de APIs...");
    expect(truncateText(text, 30).length).toBeLessThanOrEqual(30);
  });

  it("never exceeds the max length", () => {
    const text = "one two three four five six seven";

    expect(truncateText(text, 15)).toBe("one two...");
    expect(truncateText(text, 15).length).toBeLessThanOrEqual(15);
  });

  it("falls back to a hard cut when no separator exists before the limit", () => {
    expect(truncateText("supercalifragilisticexpialidocious", 20)).toBe(
      "supercalifragilis..."
    );
  });

  it("returns an empty string when max length is zero", () => {
    expect(truncateText("anything", 0)).toBe("");
  });
});
