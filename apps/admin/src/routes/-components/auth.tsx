import { useState } from "react";
import { LocaleSwitch } from "@/components/display/locale-switch";
import { ThemeSwitch } from "@/components/display/theme-switch";
import { AuthBrandPanel } from "./auth-brand-panel";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

type AuthMode = "signIn" | "signUp";

export function Auth() {
  const [mode, setMode] = useState<AuthMode>("signIn");

  return (
    <main className="container flex h-screen flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-2xl flex-wrap rounded bg-base-200">
        <AuthBrandPanel className="min-h-80 flex-1 rounded-l" />
        <div className="flex min-w-64 flex-2 flex-col p-12 max-sm:p-4">
          <div className="flex flex-col justify-center gap-8">
            {mode === "signIn" && (
              <SignIn onSwitchToSignUp={() => setMode("signUp")} />
            )}
            {mode === "signUp" && (
              <SignUp onSwitchToSignIn={() => setMode("signIn")} />
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-2xl items-center justify-between gap-2">
        <LocaleSwitch />
        <ThemeSwitch />
      </div>
    </main>
  );
}
