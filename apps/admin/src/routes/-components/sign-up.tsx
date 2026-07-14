import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SignUpForm } from "@/forms/sign-up";
import { useSignUp } from "@/hooks/mutations/auth";

export interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const { t: tAuth } = useTranslation("auth");
  const { t: tAlert } = useTranslation("alerts");
  const signUp = useSignUp();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-5xl max-sm:text-3xl">
          {tAuth("signUpTitle")}
        </h1>
        <p className="text-sm opacity-md">{tAuth("signUpSubtitle")}</p>
      </div>
      <SignUpForm
        isLoading={signUp.isPending}
        onSubmit={(values) =>
          signUp.mutate(values, {
            onSuccess: () => {
              toast.success(tAlert("signUpSuccess"));
              onSwitchToSignIn();
            },
          })
        }
      />
      <p className="text-center text-sm">
        <span className="opacity-md">{tAuth("hasAccount")} </span>
        <button
          className="link link-hover link-primary"
          onClick={onSwitchToSignIn}
          type="button"
        >
          {tAuth("switchToSignIn")}
        </button>
      </p>
    </>
  );
}
