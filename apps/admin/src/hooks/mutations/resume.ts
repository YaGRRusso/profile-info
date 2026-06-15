import { useMutation } from "@tanstack/react-query";
import type { LocaleEnum } from "@/consts/locales";
import { apiRequest } from "@/lib/api";
import { downloadBlob } from "@/lib/download-blob";

export async function fetchResumePdf(locale: LocaleEnum) {
  const response = await apiRequest(`/resume.pdf?locale=${locale}`);
  return response.blob();
}

export function useDownloadResume() {
  return useMutation({
    mutationKey: ["resume", "download"],
    mutationFn: async (locale: LocaleEnum) => {
      const blob = await fetchResumePdf(locale);
      downloadBlob(blob, `resume-${locale}.pdf`);
    },
  });
}
