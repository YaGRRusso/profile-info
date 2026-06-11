import { LOCALES, LocaleEnum } from "@/consts/locales";
import { useDownloadResume } from "@/hooks/mutations/resume";

export function DownloadCvControl() {
  const downloadResume = useDownloadResume();

  return (
    <select
      className="select"
      disabled={downloadResume.isPending}
      onChange={(event) =>
        downloadResume.mutate(event.target.value as LocaleEnum)
      }
      value=""
    >
      <option disabled value="">
        Download CV
      </option>
      {LOCALES.map((locale) => (
        <option key={locale.value} value={locale.value}>
          {locale.label}
        </option>
      ))}
    </select>
  );
}
