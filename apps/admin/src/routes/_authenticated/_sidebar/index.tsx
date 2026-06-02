import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { DataState } from "@/components/display/data-state";
import { PageTitle } from "@/components/display/page-title";
import { useDashboard } from "@/hooks/queries/dashboard";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated/_sidebar/")({
  component: RouteComponent,
});

const CHART_COLORS = [
  "#ff595e",
  "#1982c4",
  "#8ac926",
  "#ffca3a",
  "#f15bb5",
  "#6a4c93",
];

const TOOLTIP_STYLES: TooltipProps = {
  contentStyle: {
    backgroundColor: "var(--color-base-100)",
    borderRadius: 8,
    padding: 8,
  },
  cursor: { fill: "transparent" },
  itemStyle: { color: "var(--color-base-foreground)" },
  labelStyle: { color: "var(--color-base-foreground)" },
};

function ChartCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-box bg-base-200 p-4">
      <span className="font-semibold">{title}</span>
      <div className="h-64">{children}</div>
    </div>
  );
}

function RouteComponent() {
  const { user } = useAuthStore();
  const dashboard = useDashboard();
  const data = dashboard.data?.dashboard;

  const totals = data?.totals;
  const totalCards = [
    { label: "Skills", value: totals?.skills ?? 0 },
    { label: "Courses", value: totals?.courses ?? 0 },
    { label: "Educations", value: totals?.educations ?? 0 },
    { label: "Organizations", value: totals?.organizations ?? 0 },
    { label: "Projects", value: totals?.projects ?? 0 },
    { label: "Experiences", value: totals?.experiences ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        description="An overview of your profile data."
        title={`Hello, ${user?.name}!`}
      />

      <DataState
        isFetching={dashboard.isFetching}
        isLoading={dashboard.isPending}
      >
        <DataState.Loading>
          <div className="skeleton h-96 w-full" />
        </DataState.Loading>

        <DataState.Content>
          <div className="flex flex-col gap-4">
            <div className="stats stats-vertical sm:stats-horizontal w-full bg-base-200 shadow-sm">
              {totalCards.map((card) => (
                <div className="stat" key={card.label}>
                  <div className="stat-title">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ChartCard title="Skills by Category">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={data?.skillsByCategory}
                      dataKey="value"
                      innerRadius="55%"
                      nameKey="label"
                      outerRadius="80%"
                    >
                      {(data?.skillsByCategory ?? []).map((entry, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={entry.label}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip {...TOOLTIP_STYLES} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Experiences by Category">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={data?.experiencesByCategory}>
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} width={24} />
                    <Tooltip {...TOOLTIP_STYLES} />
                    <Bar dataKey="value" radius={4}>
                      {(data?.experiencesByCategory ?? []).map(
                        (entry, index) => (
                          <Cell
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            key={entry.label}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Courses by Status">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={data?.coursesByStatus}>
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} width={24} />
                    <Tooltip {...TOOLTIP_STYLES} />
                    <Bar dataKey="value" radius={4}>
                      {(data?.coursesByStatus ?? []).map((entry, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={entry.label}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </DataState.Content>
      </DataState>
    </div>
  );
}
