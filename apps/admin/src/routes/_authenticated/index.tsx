import { createFileRoute } from "@tanstack/react-router";
import { useApiStatus } from "@/hooks/queries/base";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const apiStatus = useApiStatus();

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-semibold text-3xl">Admin Panel</h1>
      <span
        className={cn(
          "badge badge-soft",
          apiStatus.data ? "badge-success" : "badge-error"
        )}
      >
        {apiStatus.data ? "Online" : "Offline"}
      </span>
    </main>
  );
}
