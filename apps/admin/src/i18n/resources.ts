import enActions from "@/locales/en/actions.json";
import enAlerts from "@/locales/en/alerts.json";
import enAuth from "@/locales/en/auth.json";
import enDashboard from "@/locales/en/dashboard.json";
import enForms from "@/locales/en/forms.json";
import enHelp from "@/locales/en/help.json";
import enNav from "@/locales/en/nav.json";
import enPages from "@/locales/en/pages.json";
import enSystem from "@/locales/en/system.json";
import enTables from "@/locales/en/tables.json";
import enValidation from "@/locales/en/validation.json";
import ptActions from "@/locales/pt/actions.json";
import ptAlerts from "@/locales/pt/alerts.json";
import ptAuth from "@/locales/pt/auth.json";
import ptDashboard from "@/locales/pt/dashboard.json";
import ptForms from "@/locales/pt/forms.json";
import ptHelp from "@/locales/pt/help.json";
import ptNav from "@/locales/pt/nav.json";
import ptPages from "@/locales/pt/pages.json";
import ptSystem from "@/locales/pt/system.json";
import ptTables from "@/locales/pt/tables.json";
import ptValidation from "@/locales/pt/validation.json";

export const i18nResources = {
  en: {
    actions: enActions,
    alerts: enAlerts,
    auth: enAuth,
    dashboard: enDashboard,
    forms: enForms,
    help: enHelp,
    nav: enNav,
    pages: enPages,
    system: enSystem,
    tables: enTables,
    validation: enValidation,
  },
  pt: {
    actions: ptActions,
    alerts: ptAlerts,
    auth: ptAuth,
    dashboard: ptDashboard,
    forms: ptForms,
    help: ptHelp,
    nav: ptNav,
    pages: ptPages,
    system: ptSystem,
    tables: ptTables,
    validation: ptValidation,
  },
} as const;

export const i18nNamespaces = [
  "actions",
  "alerts",
  "auth",
  "dashboard",
  "forms",
  "help",
  "nav",
  "pages",
  "system",
  "tables",
  "validation",
] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
