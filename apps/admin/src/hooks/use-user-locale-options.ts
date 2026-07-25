import { LOCALES } from "@/consts/locales";
import { useGetMe } from "@/hooks/queries/auth";
import { useAuthStore } from "@/stores/auth";

/** Locale select options limited to the signed-in user's supported `locales`. */
export function useUserLocaleOptions() {
  const token = useAuthStore((state) => state.token);
  const getMe = useGetMe({ enabled: !!token });
  const supported = getMe.data?.getMe.locales;

  if (!supported?.length) {
    return [...LOCALES];
  }

  return LOCALES.filter((locale) => supported.includes(locale.value));
}
