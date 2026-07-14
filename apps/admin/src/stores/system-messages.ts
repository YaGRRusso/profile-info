import { create } from "zustand";

export type SystemMessageVariant = "error" | "info" | "success" | "warning";

export interface SystemMessage {
  description?: string;
  id: string;
  title: string;
  variant?: SystemMessageVariant;
}

interface SystemMessagesStore {
  clearAllMessages: () => void;
  clearMessage: (id: string) => void;
  messages: Record<string, SystemMessage>;
  setMessage: (message: SystemMessage) => void;
}

export const useSystemMessagesStore = create<SystemMessagesStore>((set) => ({
  clearAllMessages: () => set({ messages: {} }),
  clearMessage: (id) =>
    set((state) => {
      if (!(id in state.messages)) {
        return state;
      }

      const messages = { ...state.messages };
      delete messages[id];
      return { messages };
    }),
  messages: {},
  setMessage: (message) =>
    set((state) => {
      const current = state.messages[message.id];

      if (
        current?.title === message.title &&
        current?.description === message.description &&
        current?.variant === message.variant
      ) {
        return state;
      }

      return {
        messages: { ...state.messages, [message.id]: message },
      };
    }),
}));
