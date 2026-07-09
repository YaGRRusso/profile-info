import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "dracula" | "light";

interface ThemeStore {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dracula",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "theme", storage: createJSONStorage(() => localStorage) }
  )
);
