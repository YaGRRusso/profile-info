import { HttpStatus } from "@nestjs/common";
import { shouldReportStatus } from "./should-report-status.helper";

describe("shouldReportStatus", () => {
  it("reports 5xx", () => {
    expect(shouldReportStatus(HttpStatus.INTERNAL_SERVER_ERROR)).toBe(true);
    expect(shouldReportStatus(HttpStatus.BAD_GATEWAY)).toBe(true);
  });

  it("skips 4xx", () => {
    expect(shouldReportStatus(HttpStatus.BAD_REQUEST)).toBe(false);
    expect(shouldReportStatus(HttpStatus.UNAUTHORIZED)).toBe(false);
    expect(shouldReportStatus(HttpStatus.CONFLICT)).toBe(false);
  });
});
