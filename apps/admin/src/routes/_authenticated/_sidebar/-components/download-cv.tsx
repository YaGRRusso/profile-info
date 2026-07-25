import { useTranslation } from "react-i18next";
import type { Locale } from "@/generated/graphql/graphql";
import { useDownloadResume } from "@/hooks/mutations/resume";
import { useUserLocaleOptions } from "@/hooks/use-user-locale-options";

export function DownloadCvControl() {
  const { t: tAction } = useTranslation("actions");
  const downloadResume = useDownloadResume();
  const localeOptions = useUserLocaleOptions();

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
      {localeOptions.map((locale) => (
        <option key={locale.value} value={locale.value}>
          {locale.label}
        </option>
      ))}
    </select>
  );
}
