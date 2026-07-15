import { isHttpUrl, isUrl } from "./url.helper";

describe("url.helper", () => {
  describe("isUrl", () => {
    it("accepts absolute URLs with any protocol", () => {
      expect(isUrl("https://example.com")).toBe(true);
      expect(isUrl("http://example.com/path")).toBe(true);
      expect(isUrl("ftp://files.example.com")).toBe(true);
      expect(isUrl("mailto:a@b.com")).toBe(true);
    });

    it("rejects non-URLs", () => {
      expect(isUrl("not a url")).toBe(false);
      expect(isUrl("example.com")).toBe(false);
      expect(isUrl("")).toBe(false);
    });
  });

  describe("isHttpUrl", () => {
    it("accepts only http and https", () => {
      expect(isHttpUrl("https://example.com")).toBe(true);
      expect(isHttpUrl("http://example.com")).toBe(true);
      expect(isHttpUrl("ftp://files.example.com")).toBe(false);
      expect(isHttpUrl("mailto:a@b.com")).toBe(false);
      expect(isHttpUrl("Acme Corp")).toBe(false);
    });
  });
});
