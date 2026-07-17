import { useMutation } from "@tanstack/react-query";
import type { LocaleEnum } from "@/consts/locales";
import { downloadBlob } from "@/lib/download-blob";
import { request } from "@/service/rest";
import { useAuthStore } from "@/stores/auth";

export async function fetchResumePdf(locale: LocaleEnum, userId: string) {
  const params = new URLSearchParams({ locale, userId });
  const response = await request(`/resume.pdf?${params}`);
  return response.blob();
}

export function useDownloadResume() {
  return useMutation({
    mutationFn: async (locale: LocaleEnum) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("User is not authenticated");

      const blob = await fetchResumePdf(locale, userId);
      downloadBlob(blob, `resume-${locale}.pdf`);
    },
    mutationKey: ["resume", "download"],
  });
}
