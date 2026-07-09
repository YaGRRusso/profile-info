import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useThemeStore } from "@/stores/theme";

export function ThemeSwitch() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dracula";

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
