import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserForm } from "@/forms/user";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, setUser } = useAuthStore();

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center gap-4">
        <UserForm
          onSubmit={({ username, password }) => setUser({ username, password })}
        />
      </main>
    );
  }

  return <Outlet />;
}
