import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  clearAuth: () => void;
  setToken: (token: string) => void;
  token: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearAuth: () => set({ token: null }),
    }),
    { name: "auth", storage: createJSONStorage(() => localStorage) }
  )
);
