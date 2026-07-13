import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { LOCALES } from "@/consts/locales";
import { cn } from "@/lib/cn";

interface LocaleSwitchProps
  extends Omit<ComponentProps<"select">, "onChange" | "value"> {}

export function LocaleSwitch({ className, ...props }: LocaleSwitchProps) {
  const { i18n, t: tSystem } = useTranslation("system");

  const value = LOCALES.some((locale) => locale.value === i18n.language)
    ? i18n.language
    : LOCALES[0].value;

  return (
    <select
      aria-label={tSystem("language")}
      className={cn("select select-sm max-w-64", className)}
      onChange={(event) => i18n.changeLanguage(event.target.value)}
      value={value}
      {...props}
    >
      {LOCALES.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
