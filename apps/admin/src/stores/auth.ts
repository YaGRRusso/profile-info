import { create } from "zustand";

interface User {
  password: string;
  username: string;
}

interface AuthStore {
  setUser: (user: User | undefined) => void;
  user: User | undefined;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: undefined,
  setUser: (user: User | undefined) => set({ user }),
}));
