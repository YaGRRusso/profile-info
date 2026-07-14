import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface JwtUser {
  avatar?: string | null;
  email: string;
  id: string;
  name: string;
  nickname: string;
  role?: string | null;
}

interface AuthStore {
  clearAuth: () => void;
  setToken: (token: string) => void;
  setUser: (user: JwtUser | null) => void;
  token: string | null;
  user: JwtUser | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      clearAuth: () => set({ token: null, user: null }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      token: null,
      user: null,
    }),
    { name: "auth", storage: createJSONStorage(() => localStorage) }
  )
);

/** Resolves once the persisted auth store has rehydrated from storage. */
export function waitForAuthHydration(): Promise<void> {
  if (useAuthStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
