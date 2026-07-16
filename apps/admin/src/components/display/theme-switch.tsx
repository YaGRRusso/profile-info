import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { ComponentProps, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useThemeStore } from "@/stores/theme";

interface ThemeSwitchProps extends ComponentProps<"label"> {}

export function ThemeSwitch({ className, ...props }: ThemeSwitchProps) {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <label
      className={cn(
        "toggle toggle-xl rounded-lg border-base-content/20 bg-base-100 text-base-content/80 before:rounded-lg",
        className
      )}
      {...props}
    >
      <input
        checked={isDark}
        onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
        type="checkbox"
      />
      <SunIcon aria-hidden className="size-full p-1" />
      <MoonIcon aria-hidden className="size-full p-1" />
    </label>
  );
}
