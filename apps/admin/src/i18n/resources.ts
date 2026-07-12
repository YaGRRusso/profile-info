import enActions from "@/locales/en/actions.json";
import enAlerts from "@/locales/en/alerts.json";
import enDashboard from "@/locales/en/dashboard.json";
import enForms from "@/locales/en/forms.json";
import enHelp from "@/locales/en/help.json";
import enLogin from "@/locales/en/login.json";
import enNav from "@/locales/en/nav.json";
import enPages from "@/locales/en/pages.json";
import ptActions from "@/locales/pt/actions.json";
import ptAlerts from "@/locales/pt/alerts.json";
import ptDashboard from "@/locales/pt/dashboard.json";
import ptForms from "@/locales/pt/forms.json";
import ptHelp from "@/locales/pt/help.json";
import ptLogin from "@/locales/pt/login.json";
import ptNav from "@/locales/pt/nav.json";
import ptPages from "@/locales/pt/pages.json";

export const i18nResources = {
  en: {
    actions: enActions,
    alerts: enAlerts,
    dashboard: enDashboard,
    forms: enForms,
    help: enHelp,
    login: enLogin,
    nav: enNav,
    pages: enPages,
  },
  pt: {
    actions: ptActions,
    alerts: ptAlerts,
    dashboard: ptDashboard,
    forms: ptForms,
    help: ptHelp,
    login: ptLogin,
    nav: ptNav,
    pages: ptPages,
  },
} as const;

export const i18nNamespaces = [
  "actions",
  "alerts",
  "dashboard",
  "forms",
  "help",
  "login",
  "nav",
  "pages",
] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
