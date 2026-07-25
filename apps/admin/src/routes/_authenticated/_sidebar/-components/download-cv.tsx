import { useTranslation } from "react-i18next";
import { LOCALES } from "@/consts/locales";
import type { Locale } from "@/generated/graphql/graphql";
import { useDownloadResume } from "@/hooks/mutations/resume";

export function DownloadCvControl() {
  const { t: tAction } = useTranslation("actions");
  const downloadResume = useDownloadResume();

  return (
    <select
      className="select"
      disabled={downloadResume.isPending}
      onChange={(event) => downloadResume.mutate(event.target.value as Locale)}
      value=""
    >
      <option disabled value="">
        {tAction("downloadCv")}
      </option>
      {LOCALES.map((locale) => (
        <option key={locale.value} value={locale.value}>
          {locale.label}
        </option>
      ))}
    </select>
  );
}
