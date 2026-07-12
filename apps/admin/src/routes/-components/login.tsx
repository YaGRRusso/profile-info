import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UserForm } from "@/forms/user";
import { useSignIn } from "@/hooks/mutations/auth";
import { useAuthStore } from "@/stores/auth";
import { DevQuickLogin } from "./dev-quick-login";

export function Login() {
  const { t: tLogin } = useTranslation("login");
  const { setToken } = useAuthStore();

  const queryClient = useQueryClient();
  const signIn = useSignIn();

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
              {tLogin("title")}
            </h1>
            <p className="text-sm opacity-md">{tLogin("subtitle")}</p>
          </div>
          <UserForm
            isLoading={signIn.isPending}
            onSubmit={({ email, password }) =>
              signIn.mutate(
                { email, password },
                {
                  onSuccess: (data) => {
                    queryClient.clear();
                    if (data?.signIn) setToken(data.signIn);
                  },
                }
              )
            }
          />
          <DevQuickLogin />
        </div>
      </div>
    </main>
  );
}
