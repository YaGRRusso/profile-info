import { createFileRoute } from "@tanstack/react-router";
import { useApiStatus } from "@/hooks/queries/base";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { clearAuth, user } = useAuthStore();

  const apiStatus = useApiStatus();

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
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
        <button
          className="badge badge-soft badge-error cursor-pointer"
          onClick={clearAuth}
          type="button"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
