import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { SelectInput } from "@/components/inputs/select";
import { LOCALES, LocaleEnum } from "@/consts/locales";

export function DownloadCvControl() {
  const [locale, setLocale] = useState(LocaleEnum.ENGLISH);
  const [isPending] = useState(false);

  function handleDownload() {
    console.log("download cv", { locale });
  }

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        label="CV language"
        name="cv-locale"
        onChange={(value) => setLocale(value as LocaleEnum)}
        options={LOCALES}
        value={locale}
      />
      <button
        className="btn btn-sm btn-soft mt-auto"
        disabled={isPending}
        onClick={handleDownload}
        type="button"
      >
        <DownloadSimpleIcon />
        Download CV
      </button>
    </div>
  );
}
