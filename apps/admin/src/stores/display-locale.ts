import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LocaleEnum } from "@/consts/locales";
import i18n from "@/i18n";

interface DisplayLocaleStore {
  locale: LocaleEnum;
  setLocale: (locale: LocaleEnum) => void;
}

export const useDisplayLocaleStore = create<DisplayLocaleStore>()(
  persist(
    (set) => ({
      locale: LocaleEnum.ENGLISH,
      setLocale: (locale) => {
        set({ locale });
        i18n.changeLanguage(locale);
      },
    }),
    { name: "display-locale", storage: createJSONStorage(() => localStorage) }
  )
);
