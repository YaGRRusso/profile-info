import { createInstance, type i18n as I18n } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { LocaleEnum } from "@/consts/locales";
import { i18nNamespaces, i18nResources } from "@/i18n/resources";
import { syncDayjsLocale } from "@/lib/dayjs";

const i18n: I18n = createInstance();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: i18nResources,
    fallbackLng: LocaleEnum.ENGLISH,
    supportedLngs: Object.values(LocaleEnum),
    defaultNS: "pages",
    ns: [...i18nNamespaces],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", (locale) => {
  syncDayjsLocale(locale as LocaleEnum);
});

syncDayjsLocale(i18n.language as LocaleEnum);

export default i18n;
