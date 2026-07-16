import { type CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeStore } from "@/stores/theme";

export function Toaster(props: ToasterProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Sonner
      className="toaster group"
      duration={3000}
      style={
        {
          "--normal-bg": "var(--color-base-300)",
          "--normal-border":
            "color-mix(in oklch, var(--color-base-content) 10%, transparent)",
          "--normal-text": "var(--color-base-content)",
        } as CSSProperties
      }
      theme={theme === "light" ? "light" : "dark"}
      {...props}
    />
  );
}
