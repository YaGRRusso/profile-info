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
    <main className="container flex min-h-dvh flex-col justify-center gap-4 py-8 sm:py-16">
      <div className="grid w-full overflow-hidden rounded-lg bg-base-200 lg:grid-cols-2">
        <AuthBrandPanel className="order-2 lg:order-1" />
        <div className="order-1 flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:order-2 lg:p-10">
          <div className="mx-auto flex w-full flex-col justify-center gap-8">
            {mode === "signIn" && (
              <SignIn onSwitchToSignUp={() => setMode("signUp")} />
            )}
            {mode === "signUp" && (
              <SignUp onSwitchToSignIn={() => setMode("signIn")} />
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <LocaleSwitch />
        <ThemeSwitch />
      </div>
    </main>
  );
}
