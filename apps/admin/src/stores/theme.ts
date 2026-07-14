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
      setTheme: (theme) => set({ theme }),
      theme: "dracula",
    }),
    { name: "theme", storage: createJSONStorage(() => localStorage) }
  )
);
