const FALLBACK_CHART_COLORS = [
  "#ff595e",
  "#1982c4",
  "#8ac926",
  "#ffca3a",
  "#f15bb5",
  "#6a4c93",
];

const CHART_COLOR_VARS = [
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--color-info",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-neutral",
];

export function getChartColors(count = 6): string[] {
  if (typeof document === "undefined") {
    return FALLBACK_CHART_COLORS.slice(0, count);
  }

  const styles = getComputedStyle(document.documentElement);
  const colors = CHART_COLOR_VARS.map((variable) =>
    styles.getPropertyValue(variable).trim()
  ).filter(Boolean);

  if (colors.length === 0) {
    return FALLBACK_CHART_COLORS.slice(0, count);
  }

  return Array.from(
    { length: count },
    (_, index) => colors[index % colors.length]
  );
}

export function formatChartLabel(label: string): string {
  return label
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: "var(--color-base-100)",
    border:
      "1px solid color-mix(in oklab, var(--color-base-content) 15%, transparent)",
    borderRadius: 8,
    boxShadow:
      "0 4px 12px color-mix(in oklab, var(--color-base-content) 10%, transparent)",
    padding: 8,
  },
  cursor: { fill: "transparent" },
  itemStyle: { color: "var(--color-base-content)" },
  labelStyle: { color: "var(--color-base-content)" },
} as const;

export const CHART_AXIS_PROPS = {
  axisLine: { stroke: "var(--color-base-300)" },
  tick: { fill: "var(--color-base-content)", fontSize: 12, opacity: 0.7 },
  tickLine: false,
} as const;

export const CHART_GRID_PROPS = {
  stroke: "var(--color-base-300)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;
