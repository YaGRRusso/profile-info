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
      <main className="flex h-screen items-center justify-center">
        <div className="flex w-full max-w-md flex-col justify-center gap-10 rounded bg-base-200 p-8">
          <h1 className="font-semibold text-5xl">Welcome</h1>
          <UserForm
            onSubmit={({ username, password }) =>
              setUser({ username, password })
            }
          />
        </div>
      </main>
    );
  }

  return <Outlet />;
}
