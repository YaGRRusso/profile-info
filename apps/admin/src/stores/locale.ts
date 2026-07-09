import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LocaleEnum } from "@/consts/locales";
import i18n from "@/i18n";
import { readPersistedDisplayLocale } from "@/i18n/read-persisted-display-locale";
import { syncDayjsLocale } from "@/lib/dayjs";

interface LocaleStore {
  locale: LocaleEnum;
  setLocale: (locale: LocaleEnum) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: readPersistedDisplayLocale(),
      setLocale: (locale) => {
        set({ locale });
        i18n.changeLanguage(locale);
        syncDayjsLocale(locale);
      },
    }),
    {
      name: "display-locale",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) syncDayjsLocale(state.locale);
      },
    }
  )
);
