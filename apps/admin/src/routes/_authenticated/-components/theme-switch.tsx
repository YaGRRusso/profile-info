import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { ComponentProps, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useThemeStore } from "@/stores/theme";

interface ThemeSwitchProps extends ComponentProps<"label"> {}

export function ThemeSwitch({ className, ...props }: ThemeSwitchProps) {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dracula";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <label
      className={cn(
        "toggle border-base-content/40 text-base-content/80",
        className
      )}
      {...props}
    >
      <input
        checked={isDark}
        onChange={(event) =>
          setTheme(event.target.checked ? "dracula" : "light")
        }
        type="checkbox"
      />
      <SunIcon />
      <MoonIcon />
    </label>
  );
}
