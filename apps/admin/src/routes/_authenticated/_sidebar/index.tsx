import { createFileRoute } from "@tanstack/react-router";
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
    <main className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="font-semibold text-3xl">Hello, {user?.name}!</h1>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "badge badge-soft",
            apiStatus.isSuccess ? "badge-success" : "badge-error"
          )}
        >
          {apiStatus.isSuccess ? "Online" : "Offline"}
        </span>
      </div>
    </main>
  );
}
