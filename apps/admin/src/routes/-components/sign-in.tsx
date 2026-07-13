import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { SignInForm } from "@/forms/sign-in";
import { useSignIn } from "@/hooks/mutations/auth";
import { useAuthStore } from "@/stores/auth";
import { DevQuickLogin } from "./dev-quick-login";

export interface SignInProps {
  onSwitchToSignUp: () => void;
}

export function SignIn({ onSwitchToSignUp }: SignInProps) {
  const { t: tAuth } = useTranslation("auth");
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();
  const signIn = useSignIn();

  return (
    <>
      <div className="flex flex-col">
        <h1 className="font-semibold text-5xl max-sm:text-3xl">
          {tAuth("signInTitle")}
        </h1>
        <p className="text-sm opacity-md">{tAuth("signInSubtitle")}</p>
      </div>
      <SignInForm
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
      <p className="text-center text-sm">
        <span className="opacity-md">{tAuth("noAccount")} </span>
        <button
          className="link link-hover link-primary"
          onClick={onSwitchToSignUp}
          type="button"
        >
          {tAuth("switchToSignUp")}
        </button>
      </p>
      <DevQuickLogin />
    </>
  );
}
