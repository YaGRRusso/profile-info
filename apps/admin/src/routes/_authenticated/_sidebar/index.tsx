import { createFileRoute } from "@tanstack/react-router";
import { DataState } from "@/components/display/data-state";
import { PageTitle } from "@/components/display/page-title";
import { useGetMe } from "@/hooks/queries/auth";
import { useDashboard } from "@/hooks/queries/dashboard";
import { DashboardCharts } from "./-components/dashboard-charts";
import { DashboardSkeleton } from "./-components/dashboard-skeleton";
import { DashboardStats } from "./-components/dashboard-stats";
import { ProfileCompleteness } from "./-components/profile-completeness";
import { RecentActivity } from "./-components/recent-activity";

export const Route = createFileRoute("/_authenticated/_sidebar/")({
  component: RouteComponent,
});

function RouteComponent() {
  const getMe = useGetMe();
  const dashboard = useDashboard();
  const data = dashboard.data?.dashboard;
  const user = getMe.data?.getMe;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          description="Main dashboard for your profile."
          title={`Hello, ${user?.name}!`}
        />
        <ProfileCompleteness user={user} />
      </div>

      <DataState
        isFetching={dashboard.isFetching}
        isLoading={dashboard.isPending || getMe.isPending}
      >
        <DataState.Loading>
          <DashboardSkeleton />
        </DataState.Loading>

        <DataState.Content>
          {data && (
            <div className="flex flex-col gap-4">
              <DashboardStats totals={data.totals} />
              <DashboardCharts data={data} />
              <RecentActivity items={data.recentActivity} />
            </div>
          )}
        </DataState.Content>
      </DataState>
    </div>
  );
}
