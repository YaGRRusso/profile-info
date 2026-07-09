import { useTranslation } from "react-i18next";

export type PageCopyKey =
  | "settings"
  | "courses"
  | "skills"
  | "educations"
  | "organizations"
  | "projects"
  | "experiences"
  | "apiTokens";

export function usePageCopy(key: PageCopyKey) {
  const { t } = useTranslation("pages");

  const entity = t(`${key}.entity`);
  const entityPlural = t(`${key}.entityPlural`);

  return {
    manageTitle: t(`${key}.manageTitle`),
    manageDescription: t(`${key}.manageDescription`),
    modalManage: t(`${key}.modalManage`),
    modalBatchUpdate: t(`${key}.modalBatchUpdate`),
    modalRead: t(`${key}.modalRead`),
    modalFillDetails: t("shared.modalFillDetails"),
    modalReadDescription: t("shared.modalReadDescription", { entity }),
    batchUpdateDescription: (count: number) =>
      t("shared.modalBatchUpdateDescription", { count, entityPlural }),
    deleteTitle: t("shared.deleteTitle", { entityPlural }),
    deleteDescription: t("shared.deleteDescription", { entityPlural }),
    disableTitle: t("shared.disableTitle", { entityPlural }),
    disableDescription: t("shared.disableDescription", { entityPlural }),
    enableTitle: t("shared.enableTitle", { entityPlural }),
    enableDescription: t("shared.enableDescription", { entityPlural }),
    newApiTokenTitle: t("shared.newApiTokenTitle"),
    newApiTokenDescription: t("shared.newApiTokenDescription"),
    emptyTitle: t("shared.emptyTitle"),
    emptyDescription: t("shared.emptyDescription", { entity }),
  };
}

export function useSettingsPageCopy() {
  const { t } = useTranslation("pages");
  return {
    title: t("settings.title"),
    description: t("settings.description"),
  };
}
