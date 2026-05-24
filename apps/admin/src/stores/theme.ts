import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface PreferencesStore {
  setTheme: (theme: ThemePreference) => void;
  theme: ThemePreference;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme: ThemePreference) => set({ theme }),
    }),
    { name: "preference", storage: createJSONStorage(() => localStorage) }
  )
);
