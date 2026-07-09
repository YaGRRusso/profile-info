import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

export function ThemeSwitch() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dracula";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <label className="toggle border-base-content/40 text-base-content/80">
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
