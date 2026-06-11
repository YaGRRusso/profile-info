import { Locale } from "@/common/i18n/locales";
import { formatPeriod } from "./format-period.helper";

describe("formatPeriod", () => {
  const period = {
    from: new Date(Date.UTC(2020, 0, 15)),
    to: new Date(Date.UTC(2022, 5, 15)),
  };

  it("formats dates in English", () => {
    expect(formatPeriod(period, Locale.EN)).toBe("Jan 2020 – Jun 2022");
  });

  it("formats dates in Portuguese", () => {
    expect(formatPeriod(period, Locale.PT)).toBe("jan. de 2020 – jun. de 2022");
  });

  it("uses the locale present label when end date is missing", () => {
    expect(formatPeriod({ from: period.from }, Locale.EN)).toBe(
      "Jan 2020 – Present"
    );
    expect(formatPeriod({ from: period.from }, Locale.PT)).toBe(
      "jan. de 2020 – Atual"
    );
  });

  it("returns undefined when start date is missing", () => {
    expect(formatPeriod(undefined, Locale.EN)).toBeUndefined();
  });
});
