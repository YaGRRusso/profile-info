import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "@/generated/graphql/graphql";
import { useUpdateMe } from "@/hooks/mutations/users";
import { useUserLocaleOptions } from "@/hooks/use-user-locale-options";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth";

interface LocaleSwitchProps
  extends Omit<ComponentProps<"select">, "onChange" | "value"> {}

export function LocaleSwitch({ className, ...props }: LocaleSwitchProps) {
  const { i18n, t: tSystem } = useTranslation("system");
  const token = useAuthStore((state) => state.token);
  const updateMe = useUpdateMe();
  const options = useUserLocaleOptions();

  const value = options.some((locale) => locale.value === i18n.language)
    ? i18n.language
    : options[0].value;

  return (
    <select
      aria-label={tSystem("language")}
      className={cn("select select-sm", className)}
      disabled={updateMe.isPending}
      onChange={(event) => {
        const locale = event.target.value as Locale;
        i18n.changeLanguage(locale);

        if (token) {
          updateMe.mutate({ locale });
        }
      }}
      value={value}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
