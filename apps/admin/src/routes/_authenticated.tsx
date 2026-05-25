import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { UserForm } from "@/forms/user";
import { useSignIn } from "@/hooks/mutations/auth";
import { useGetMe } from "@/hooks/queries/auth";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token, setToken, setUser } = useAuthStore();

  const signIn = useSignIn();
  const getMe = useGetMe({ enabled: !!token });
  const user = getMe.data?.getMe;

  useEffect(() => {
    if (user) {
      setUser({
        avatar: user.avatar,
        email: user.email,
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        role: user.role,
      });
    }
  }, [user, setUser]);

  if (!token) {
    return (
      <main className="container flex h-screen items-center justify-center">
        <div className="flex w-full max-w-xl flex-wrap rounded bg-base-200">
          <div className="min-w-32 flex-1">
            <img
              alt="illustration"
              className="h-full w-full rounded object-cover"
              height={320}
              src="https://picsum.photos/320"
              width={320}
            />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-10 p-12 max-sm:p-4">
            <div className="flex flex-col">
              <h1 className="font-semibold text-5xl max-sm:text-3xl">
                Welcome
              </h1>
              <p className="text-sm opacity-60">
                Sign in to your account to continue
              </p>
            </div>
            <UserForm
              isLoading={signIn.isPending}
              onSubmit={({ email, password }) =>
                signIn.mutate(
                  { email, password },
                  {
                    onSuccess: (data) => {
                      if (data?.signIn) setToken(data.signIn);
                    },
                    onError: (error) => {
                      toast.error(error.message);
                    },
                  }
                )
              }
            />
          </div>
        </div>
      </main>
    );
  }

  return <Outlet />;
}
