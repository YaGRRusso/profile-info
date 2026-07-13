import { useState } from "react";
import { LocaleSwitch } from "@/components/display/locale-switch";
import { ThemeSwitch } from "@/components/display/theme-switch";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

type AuthMode = "signIn" | "signUp";

export function Auth() {
  const [mode, setMode] = useState<AuthMode>("signIn");

  return (
    <main className="container flex h-screen flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-3xl flex-wrap rounded bg-base-200">
        <div className="min-w-32 flex-1 max-sm:hidden">
          <img
            alt="illustration"
            className="h-full w-full rounded object-cover"
            height={320}
            src="https://picsum.photos/320"
            width={320}
          />
        </div>
        <div className="flex flex-1 flex-col p-12 max-sm:p-4">
          <div className="flex flex-1 flex-col justify-center gap-10">
            {mode === "signIn" && (
              <SignIn onSwitchToSignUp={() => setMode("signUp")} />
            )}
            {mode === "signUp" && (
              <SignUp onSwitchToSignIn={() => setMode("signIn")} />
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-3xl items-center justify-end gap-2 max-sm:justify-center">
        <LocaleSwitch />
        <ThemeSwitch />
      </div>
    </main>
  );
}
