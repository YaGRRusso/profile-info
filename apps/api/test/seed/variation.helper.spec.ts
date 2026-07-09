import {
  arrayCount,
  optionalForIndex,
  pickArraySize,
  pickTextSize,
} from "@seed/helpers/variation.helper";

describe("seed variation helpers", () => {
  it("cycles text sizes across indices", () => {
    expect(pickTextSize(0)).toBe("small");
    expect(pickTextSize(1)).toBe("medium");
    expect(pickTextSize(2)).toBe("large");
    expect(pickTextSize(3)).toBe("small");
  });

  it("cycles array sizes across indices", () => {
    expect(pickArraySize(0)).toBe("empty");
    expect(pickArraySize(1)).toBe("short");
    expect(pickArraySize(2)).toBe("medium");
    expect(pickArraySize(3)).toBe("large");
  });

  it("alternates optional field presence", () => {
    expect(optionalForIndex(0, () => "yes")).toBe("yes");
    expect(optionalForIndex(1, () => "yes")).toBeUndefined();
  });

  it("maps array sizes to fixed counts", () => {
    expect(arrayCount("empty")).toBe(0);
    expect(arrayCount("short")).toBe(2);
    expect(arrayCount("medium")).toBe(5);
    expect(arrayCount("large")).toBe(12);
  });
});
