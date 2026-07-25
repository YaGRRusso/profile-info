import { createInstance, type i18n as I18n } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { isLocale } from "@/consts/locales";
import { Locale } from "@/generated/graphql/graphql";
import { i18nNamespaces, i18nResources } from "@/i18n/resources";
import { syncDayjsLocale } from "@/lib/dayjs";

const i18n: I18n = createInstance();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS: "pages",
    detection: {
      caches: ["localStorage"],
      order: ["localStorage"],
    },
    fallbackLng: Locale.En,
    interpolation: { escapeValue: false },
    ns: [...i18nNamespaces],
    react: { useSuspense: false },
    resources: i18nResources,
    supportedLngs: Object.values(Locale),
  });

i18n.on("languageChanged", (locale) => {
  syncDayjsLocale(isLocale(locale) ? locale : Locale.En);
});

syncDayjsLocale(isLocale(i18n.language) ? i18n.language : Locale.En);

export default i18n;
