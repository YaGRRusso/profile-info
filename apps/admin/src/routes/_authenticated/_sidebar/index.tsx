import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/display/page-title";
import { useApiStatus } from "@/hooks/queries/base";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated/_sidebar/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const apiStatus = useApiStatus();

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        description="Manage your personal infos."
        title={`Hello, ${user?.name}!`}
      />
      <span
        className={cn(
          "badge badge-soft",
          apiStatus.isSuccess ? "badge-success" : "badge-error"
        )}
      >
        {apiStatus.isSuccess ? "Online" : "Offline"}
      </span>
    </div>
  );
}
