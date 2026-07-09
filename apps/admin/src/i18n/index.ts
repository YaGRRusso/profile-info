import { createInstance, type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { LocaleEnum } from "@/consts/locales";
import { readPersistedDisplayLocale } from "@/i18n/read-persisted-display-locale";
import { i18nNamespaces, i18nResources } from "@/i18n/resources";

const i18n: I18n = createInstance();

i18n.use(initReactI18next).init({
  resources: i18nResources,
  lng: readPersistedDisplayLocale(),
  fallbackLng: LocaleEnum.ENGLISH,
  supportedLngs: Object.values(LocaleEnum),
  defaultNS: "pages",
  ns: [...i18nNamespaces],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
