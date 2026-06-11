import { LOCALES, LocaleEnum } from "@/consts/locales";
import { downloadBlob } from "@/lib/download-blob";

// TODO refactor this to use the API directly
export function DownloadCvControl() {
  async function handleDownload(locale: LocaleEnum) {
    const baseUrl = import.meta.env.VITE_API_URL.replace("/graphql", "");
    const response = await fetch(`${baseUrl}/resume.pdf?locale=${locale}`);
    const blob = await response.blob();
    downloadBlob(blob, "resume.pdf");
  }

  return (
    <select
      className="select"
      disabled={false}
      onChange={(event) => handleDownload(event.target.value as LocaleEnum)}
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
