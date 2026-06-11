import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme";

export interface ThemeOption {
  icon: ReactNode;
  label: string;
  value: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { icon: <MoonIcon />, label: "Dark", value: "dracula" },
  { icon: <SunIcon />, label: "Light", value: "light" },
];

export function ThemeSwitch() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="join is-drawer-close:hidden w-full rounded px-4">
      {THEME_OPTIONS.map((option) => (
        <label
          className="btn btn-sm join-item has-checked:btn-neutral flex-1"
          key={option.value}
        >
          <input
            aria-label={option.label}
            checked={theme === option.value}
            className="theme-controller hidden"
            name="theme-buttons"
            onChange={() => setTheme(option.value)}
            type="radio"
            value={option.value}
          />
          {option.icon}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
