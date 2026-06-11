import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, ChartCardProps } from "@/components/display/chart-card";
import type { DashboardQuery } from "@/generated/graphql/graphql";
import {
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_TOOLTIP_PROPS,
  formatChartLabel,
  getChartColors,
} from "@/lib/chart-theme";

function ChartGradients({ colors }: { colors: string[] }) {
  return (
    <defs>
      {colors.map((color, index) => (
        <linearGradient
          id={`chart-gradient-${index}`}
          key={color}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
        </linearGradient>
      ))}
    </defs>
  );
}

interface CategoryBarChartProps extends Omit<ChartCardProps, "children"> {
  data: Array<{ label: string; value: number }>;
}

function CategoryBarChart({ data, ...props }: CategoryBarChartProps) {
  const colors = useMemo(() => getChartColors(data.length || 3), [data.length]);
  const formattedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        displayLabel: formatChartLabel(item.label),
      })),
    [data]
  );

  return (
    <ChartCard {...props}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={formattedData}>
          <ChartGradients colors={colors} />
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis
            {...CHART_AXIS_PROPS}
            dataKey="displayLabel"
            interval={0}
            tick={{ ...CHART_AXIS_PROPS.tick, fontSize: 11 }}
          />
          <YAxis {...CHART_AXIS_PROPS} allowDecimals={false} width={28} />
          <Tooltip
            {...CHART_TOOLTIP_PROPS}
            formatter={(value) => [value, "Count"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.displayLabel ?? ""
            }
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell
                fill={`url(#chart-gradient-${index % colors.length})`}
                key={entry.label}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

type DashboardData = NonNullable<DashboardQuery["dashboard"]>;

interface DashboardChartsProps {
  data: DashboardData;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const skillsTotal = useMemo(
    () => data.skillsByCategory.reduce((sum, item) => sum + item.value, 0),
    [data.skillsByCategory]
  );
  const pieColors = useMemo(
    () => getChartColors(data.skillsByCategory.length || 5),
    [data.skillsByCategory.length]
  );
  const pieData = useMemo(
    () =>
      data.skillsByCategory.map((item) => ({
        ...item,
        displayLabel: formatChartLabel(item.label),
      })),
    [data.skillsByCategory]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2" title="Skills by Category">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <ChartGradients colors={pieColors} />
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius="58%"
                labelLine={false}
                nameKey="displayLabel"
                outerRadius="82%"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    fill={`url(#chart-gradient-${index % pieColors.length})`}
                    key={entry.label}
                  />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span className="text-xs uppercase opacity-80">{value}</span>
                )}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                formatter={(value) => [value, "Skills"]}
              />
              <text
                dominantBaseline="middle"
                fill="var(--color-base-content)"
                textAnchor="middle"
                x="50%"
                y="46%"
              >
                <tspan fontSize={28} fontWeight={700}>
                  {skillsTotal}
                </tspan>
                <tspan dy="1.4em" fontSize={12} opacity={0.6} x="50%">
                  skills
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="flex flex-col gap-4">
          <CategoryBarChart
            data={data.experiencesByCategory}
            title="Experiences by Category"
          />
          <CategoryBarChart
            data={data.coursesByStatus}
            title="Courses by Status"
          />
        </div>
      </div>
    </div>
  );
}
