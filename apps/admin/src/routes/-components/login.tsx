import { toast } from "react-toastify";
import { UserForm } from "@/forms/user";
import { useSignIn } from "@/hooks/mutations/auth";
import { useAuthStore } from "@/stores/auth";

export function Login() {
  const { setToken } = useAuthStore();
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
            <h1 className="font-semibold text-5xl max-sm:text-3xl">Welcome</h1>
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
