import { isWebpageUrl } from "./url.helper";

describe("url.helper", () => {
  describe("isWebpageUrl", () => {
    it("accepts extensionless http(s) pages and html", () => {
      expect(isWebpageUrl("https://example.com")).toBe(true);
      expect(isWebpageUrl("https://example.com/about")).toBe(true);
      expect(isWebpageUrl("https://example.com/index.html")).toBe(true);
      expect(isWebpageUrl("http://example.com/page.php")).toBe(true);
    });

    it("rejects non-http URLs and non-websites", () => {
      expect(isWebpageUrl("ftp://example.com/page.html")).toBe(false);
      expect(isWebpageUrl("Acme Corp")).toBe(false);
      expect(isWebpageUrl("https://example.com/data.json")).toBe(false);
      expect(isWebpageUrl("https://example.com/logo.png")).toBe(false);
      expect(isWebpageUrl("https://example.com/doc.pdf")).toBe(false);
      expect(isWebpageUrl("https://example.com/app.js")).toBe(false);
    });
  });
});
